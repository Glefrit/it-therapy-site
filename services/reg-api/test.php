<?php
require __DIR__.'/app.php';
function check($ok,$message){if(!$ok)throw new RuntimeException($message);}
$doc=['schemaVersion'=>1,'d1MigrationCompleted'=>true,'polls'=>[]];$sha=1;$conflict=false;$fail=false;
$transport=function($method,$body)use(&$doc,&$sha,&$conflict,&$fail){
 if($method==='GET')return [200,['sha'=>(string)$sha,'content'=>base64_encode(json_encode($doc))]];
 if($fail)return [403,[]];
 if($conflict){$conflict=false;$doc['polls'][0]['answers'][]=['id'=>'parallel','answer'=>'Другой ответ','createdAt'=>1];$sha++;return [409,[]];}
 if($body['sha']!==(string)$sha)return [409,[]];
 $doc=json_decode(base64_decode($body['content']),true);$sha++;return [200,[]];
};
$dir=sys_get_temp_dir().'/polls-test-'.bin2hex(random_bytes(8));
$app=new PollApp(['githubToken'=>'test','rateSecret'=>'test','passwordHash'=>'salt:'.hash_pbkdf2('sha256','test-password','salt',100000,64)],$dir,$transport);
try{
 check($app->handle('GET','/api/admin/polls')[0]===401,'missing auth');
 check($app->handle('POST','/api/admin/session',['password'=>'wrong'],'','ip1')[0]===401,'bad password');
 [$status,$session]=$app->handle('POST','/api/admin/session',['password'=>'test-password'],'','ip1');check($status===200,'login');$auth='Bearer '.$session['token'];
 [$status,$created]=$app->handle('POST','/api/admin/polls',['question'=>'Вопрос ☀'],$auth);check($status===201,'create');$id=$created['poll']['id'];
 $conflict=true;check($app->handle('POST','/api/polls/'.$id.'/responses',['answer'=>'Ответ ✓'])[0]===201,'conflict retry');check(count($doc['polls'][0]['answers'])===2,'preserve concurrent response');
 $fail=true;try{$app->handle('POST','/api/polls/'.$id.'/responses',['answer'=>'Not saved']);throw new Exception('expected fail');}catch(RuntimeException $e){}$fail=false;check(count($doc['polls'][0]['answers'])===2,'failed write unchanged');
 check($app->handle('DELETE','/api/admin/polls/'.$id,['confirmId'=>'wrong'],$auth)[0]===400,'delete confirmation');
 check($app->handle('DELETE','/api/admin/polls/'.$id,['confirmId'=>$id],$auth)[0]===200,'delete');check($app->handle('GET','/api/polls/'.$id)[0]===404,'deleted');
 $app->handle('DELETE','/api/admin/session',[],$auth);check($app->handle('GET','/api/admin/polls',[],$auth)[0]===401,'logout');
 for($i=0;$i<5;$i++)check($app->handle('POST','/api/admin/session',['password'=>'wrong'],'','ip2')[0]===401,'attempt');
 check($app->handle('POST','/api/admin/session',['password'=>'test-password'],'','ip2')[0]===429,'rate limit');
 echo "PASS auth, rate limit, Unicode, conflict retry, failed write, deletion, logout\n";
}finally{foreach(glob($dir.'/*') as $file)unlink($file);rmdir($dir);}
