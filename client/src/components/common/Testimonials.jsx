import React from "react";
import { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const patientReviews = [
  {
    id: 1,
    name: "Ayesha Khan",
    location: "Karachi, Pakistan",
    review:
      "A very helpful app for booking appointments and searching for the required doctors. Has made my life a lot easy. I would strongly recommend this to all",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 2,
    name: "Ali Raza",
    location: "Lahore, Pakistan",
    review:
      "Great platform, very efficient and works really well on both phone and web. I think this is the most easiest way of booking appointments in Pakistan as it has made the whole process much more efficient.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Sara Ahmed",
    location: "Islamabad, Pakistan",
    review:
      "Literally the best website to book the appointments online for Doctors. The service is great, helpline guys are very cooperative and understanding. And I don't have to hassle through different hospitals anymore now.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 4,
    name: "Hamza Ali",
    location: "Karachi, Pakistan",
    review:
      "The only good healthcare website in Pakistan. The suggested doctors are good and the doctors on the forum ate very responsive too",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/50.jpg",
  },
  {
    id: 5,
    name: "Fatima Noor",
    location: "Lahore, Pakistan",
    review:
      "Very helpful staff. Helped me book appointment with my gastroenterologist. I do all my scheduling through oladoc now. Thanks a bunch.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    id: 6,
    name: "Usman Khan",
    location: "Islamabad, Pakistan",
    review:
      "The only good healthcare website in Pakistan. The suggested doctors are good and the doctors on the forum ate very responsive too",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

const Testimonials = () => {
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  return (
    <div className="my-8 w-full">
      <h1 className="text-center text-primary font-semibold text-3xl my-4">
        Testimonials
      </h1>

      <Carousel plugins={[autoplay.current]} className="w-full" snap="center">
        <CarouselContent className="-ml-1">
          {patientReviews.slice(0, 6).map((review) => (
            <CarouselItem
              key={review.id}
              className="basis-1/2 pl-1 lg:basis-1/3"
            >
              <div className="p-2 min-h-60 h-full">
                <div className="h-full flex flex-col items-center space-y-3 p-4 border bg-card shadow-md rounded-2xl">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="text-yellow-300 fill-amber-300 size-6"
                      />
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="text-yellow-300 fill-amber-300 size-6"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    {review.location}
                  </p>
                  <p className="text-center text-muted-foreground font-normal  ">
                    "{review.review}"
                  </p>

                  <Avatar className="w-16 h-16 mb-3 shadow-lg">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt={review.name}
                    />
                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-primary">
                    {review.name}
                  </h3>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="text-primary" />
        <CarouselNext className="text-primary" />
      </Carousel>
    </div>
  );
};

export default Testimonials;
