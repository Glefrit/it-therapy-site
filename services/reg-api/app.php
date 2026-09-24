<?php
declare(strict_types=1);
final class PollApp {
    private array $config;
    private string $stateDir;
    private $transport;
    public function __construct(array $config, string $stateDir, ?callable $transport = null) {
        $this->config=$config; $this->stateDir=$stateDir; $this->transport=$transport;
        if (!is_dir($stateDir) && !mkdir($stateDir,0700,true)) throw new RuntimeException('State unavailable');
    }
    private function state(callable $change) {
        $f=fopen($this->stateDir.'/auth.lock','c+');
        if (!$f || !flock($f, LOCK_EX)) throw new RuntimeException('State lock unavailable');
        try {
            $raw=is_file($this->stateDir.'/auth.json') ? file_get_contents($this->stateDir.'/auth.json') : '';
            $data=$raw === '' ? ['sessions'=>[], 'limits'=>[]] : json_decode($raw,true,512,JSON_THROW_ON_ERROR);
            foreach ($data['sessions'] as $k=>$v) if ($v < time()) unset($data['sessions'][$k]);
            foreach ($data['limits'] as $k=>$v) if ($v['expires'] < time()) unset($data['limits'][$k]);
            $result=$change($data);
            $json=json_encode($data,JSON_THROW_ON_ERROR);
            $temp=$this->stateDir.'/auth.tmp';
            if(file_put_contents($temp,$json)!==strlen($json)||!rename($temp,$this->stateDir.'/auth.json'))throw new RuntimeException('State write failed');
            return $result;
        } finally { flock($f,LOCK_UN); fclose($f); }
    }
    private function token(string $header): string { return preg_match('/^Bearer ([a-f0-9]{64})$/D',$header,$m) ? hash('sha256',$m[1]) : ''; }
    private function authorized(string $header): bool {
        $hash=$this->token($header);
        return $hash!=='' && $this->state(fn(&$d)=>isset($d['sessions'][$hash]) && $d['sessions'][$hash]>time());
    }
    private function login(array $body, string $ip): array {
        $now=time(); $window=intdiv($now,900);
        $keys=['ip:'.hash_hmac('sha256',$ip,$this->config['rateSecret']).':'.$window,'global:'.$window];
        $counts=$this->state(function(&$d)use($keys,$now){$out=[]; foreach($keys as $key){$v=$d['limits'][$key]??['n'=>0,'expires'=>$now+1800];$v['n']++;$d['limits'][$key]=$v;$out[]=$v['n'];}return $out;});
        if($counts[0]>5 || $counts[1]>30)return [429,['error'=>'Слишком много попыток. Попробуйте через 15 минут.']];
        $password=$body['password']??null;
        if(!is_string($password)||strlen($password)>128)return [401,['error'=>'Неверный пароль']];
        [$salt,$expected]=explode(':',$this->config['passwordHash'],2);
        if(!hash_equals($expected,hash_pbkdf2('sha256',$password,$salt,100000,64)))return [401,['error'=>'Неверный пароль']];
        $token=bin2hex(random_bytes(32));$expires=time()+28800;$hash=hash('sha256',$token);
        $this->state(function(&$d)use($hash,$expires){$d['sessions'][$hash]=$expires;});
        return [200,['token'=>$token,'expiresAt'=>$expires*1000]];
    }
    private function github(string $method, ?array $body=null): array {
        if($this->transport)return ($this->transport)($method,$body);
        $url='https://api.github.com/repos/Glefrit/it-therapy-site/contents/data/polls.json'.($method==='GET'?'?ref=main':'');
        $ch=curl_init($url);
        curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_CONNECTTIMEOUT=>8,CURLOPT_TIMEOUT=>20,CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$this->config['githubToken'],'Accept: application/vnd.github+json','User-Agent: it-therapy-polls','X-GitHub-Api-Version: 2022-11-28','Content-Type: application/json','Cache-Control: no-cache']]);
        if($body!==null)curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode($body,JSON_THROW_ON_ERROR));
        $raw=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_RESPONSE_CODE);curl_close($ch);
        if($raw===false)throw new RuntimeException('GitHub unavailable');
        return [$status,json_decode($raw,true,512,JSON_THROW_ON_ERROR)];
    }
    private function read(): array {
        [$status,$file]=$this->github('GET');
        if($status!==200)throw new RuntimeException('GitHub read failed');
        $doc=json_decode(base64_decode($file['content'],true),true,512,JSON_THROW_ON_ERROR);
        if(($doc['schemaVersion']??0)!==1 || !isset($doc['polls']) || !is_array($doc['polls']))throw new RuntimeException('Invalid storage');
        return [$file['sha'],$doc];
    }
    private function write(string $message, callable $change): array {
        for($attempt=0;$attempt<6;$attempt++){
            [$sha,$doc]=$this->read();
            $result=$change($doc);
            if($result[0]>=400)return $result;
            $doc['updatedAt']=gmdate('c');
            $content=base64_encode(json_encode($doc,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n");
            if(strlen($content)>1250000)throw new RuntimeException('Storage capacity reached');
            [$status]=$this->github('PUT',['sha'=>$sha,'branch'=>'main','message'=>$message.' [skip ci]','content'=>$content]);
            if($status===200||$status===201)return $result;
            if($status!==409&&$status!==422)throw new RuntimeException('GitHub write failed');
            usleep(100000*($attempt+1));
        }
        throw new RuntimeException('Concurrent update limit');
    }
    public function handle(string $method,string $route,array $body=[],string $header='',string $ip='unknown'): array {
        $parts=parse_url($route);$path=$parts['path']??'';parse_str($parts['query']??'',$query);
        if($path==='/health'&&$method==='GET')return [200,['ok'=>true,'service'=>'it-therapy-polls','storage'=>'github','version'=>1]];
        if($path==='/api/admin/session'){
            if($method==='POST')return $this->login($body,$ip);
            if($method==='DELETE'){$hash=$this->token($header);$this->state(function(&$d)use($hash){unset($d['sessions'][$hash]);});return [200,['ok'=>true]];}
            if($method==='GET')return $this->authorized($header)?[200,['ok'=>true]]:[401,['error'=>'Войдите с паролем']];
        }
        if(str_starts_with($path,'/api/admin/')&&!$this->authorized($header))return [401,['error'=>'Нет доступа']];
        if($path==='/api/admin/polls'&&$method==='POST'){
            $question=$body['question']??null;
            if(!is_string($question)||trim($question)===''||mb_strlen($question)>300)return [400,['error'=>'Введите вопрос до 300 символов']];
            $poll=['id'=>bin2hex(random_bytes(6)),'question'=>trim($question),'createdAt'=>(int)(microtime(true)*1000),'answers'=>[]];
            return $this->write('Create poll '.$poll['id'],function(&$doc)use($poll){foreach($doc['polls'] as $p)if($p['id']===$poll['id'])return [201,['poll'=>$p]];array_unshift($doc['polls'],$poll);return [201,['poll'=>$poll]];});
        }
        if($path==='/api/admin/polls'&&$method==='GET'){
            [, $doc]=$this->read();
            if(isset($query['id'])){foreach($doc['polls'] as $p)if($p['id']===$query['id']){$answers=$p['answers'];unset($p['answers']);usort($answers,fn($a,$b)=>$b['createdAt']<=>$a['createdAt']);return [200,['poll'=>$p,'answers'=>$answers]];}return [404,['error'=>'Опрос не найден']];}
            $polls=array_map(function($p){$p['answerCount']=count($p['answers']);unset($p['answers']);return $p;},$doc['polls']);usort($polls,fn($a,$b)=>$b['createdAt']<=>$a['createdAt']);return [200,['polls'=>$polls]];
        }
        if(preg_match('~^/api/admin/polls/([a-zA-Z0-9_-]{1,64})$~D',$path,$m)&&$method==='DELETE'){
            $id=$m[1];if(($body['confirmId']??null)!==$id)return [400,['error'=>'Подтвердите удаление выбранного опроса']];
            return $this->write('Remove poll '.$id,function(&$doc)use($id){foreach($doc['polls'] as $i=>$p)if($p['id']===$id){array_splice($doc['polls'],$i,1);return [200,['ok'=>true]];}return [404,['error'=>'Опрос не найден']];});
        }
        if(preg_match('~^/api/polls/([a-zA-Z0-9_-]{1,64})(/responses)?$~D',$path,$m)){
            $id=$m[1];
            if($method==='GET'&&!isset($m[2])){[, $doc]=$this->read();foreach($doc['polls'] as $p)if($p['id']===$id)return [200,['poll'=>['id'=>$id,'question'=>$p['question']]]];return [404,['error'=>'Опрос не найден']];}
            if($method==='POST'&&isset($m[2])){
                $answer=$body['answer']??null;if(!is_string($answer)||trim($answer)===''||mb_strlen($answer)>1000)return [400,['error'=>'Введите ответ до 1000 символов']];
                $item=['id'=>bin2hex(random_bytes(16)),'answer'=>trim($answer),'createdAt'=>(int)(microtime(true)*1000)];
                return $this->write('Answer poll '.$id,function(&$doc)use($id,$item){foreach($doc['polls'] as &$p)if($p['id']===$id){foreach($p['answers'] as $a)if($a['id']===$item['id'])return [201,['ok'=>true]];array_unshift($p['answers'],$item);return [201,['ok'=>true]];}return [404,['error'=>'Опрос не найден']];});
            }
        }
        return [404,['error'=>'Не найдено']];
    }
}
