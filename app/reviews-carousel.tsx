"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const reviews = [
  { title:"Озарение по ту сторону", text:"Сейчас, отыграв на стороне заказчика, я понял, почему полгода назад мой заказчик не выбрал нас!" },
  { title:"Тревожные звоночки", text:"Наш уровень презентации слабее, чем у других, а менеджеры не понимают логику этапности проекта." },
  { title:"Молниеносная обратная связь", text:"При лучшей оценке и адекватных ответах на вопросы мы не выбрали вас, потому что РП перебивал коллегу." },
  { title:"Идеальное попадание", text:"Ваша оценка аналогична той, что была в реальности. Другие команды оценили на порядок дешевле, что сразу вызвало подозрение заказчика." },
  { title:"Новые звёзды", text:"Когда она начала говорить, мне стало не важно, как они сделают проект и за какие деньги. Я готов был у неё купить!" },
  { title:"Коучинговые приёмы", text:"Вы отводите глаза, и очень заметна напряжённость позы. Это отталкивает, несмотря на прекрасную презентацию." },
  { title:"Адский тайминг", text:"Ваша команда прекрасно ответила на все вопросы, но вы не успели согласовать позиции по оценке и проиграли." },
  { title:"Инфаркт проектника", text:"Как вы сможете сделать проект за указанный бюджет, если число людей, умноженное на ставку, даёт сумму в пять раз больше?" },
];

export function ReviewsCarousel(){
  return (
    <Carousel className="reviews-carousel" opts={{ align:"start", loop:true }} aria-label="Отзывы участников">
      <CarouselContent className="reviews-track">
        {reviews.map((review,index)=>(
          <CarouselItem className="review-slide" key={review.title}>
            <blockquote>
              <span>{String(index+1).padStart(2,"0")} / {String(reviews.length).padStart(2,"0")}</span>
              <h3>{review.title}</h3>
              <p>«{review.text}»</p>
              <cite>Отзыв участника</cite>
            </blockquote>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="review-controls">
        <CarouselPrevious className="review-prev" />
        <CarouselNext className="review-next" />
      </div>
    </Carousel>
  );
}
