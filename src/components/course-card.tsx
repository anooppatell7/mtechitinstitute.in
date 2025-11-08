
import Image from "next/image";
import type { Course } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, IndianRupee, Tag } from "lucide-react";
import { EnrollModal } from "./enroll-modal";

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  const summary = course.description.length > 100 
    ? `${course.description.substring(0, 100)}...` 
    : course.description;

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl group">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden">
            <Image
                src={course.image}
                alt={`${course.title} course at MTech IT Institute`}
                data-ai-hint={course.title.split(' ').slice(0,2).join(' ').toLowerCase()}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <CardTitle className="font-headline text-xl mb-2">{course.title}</CardTitle>
        <CardDescription className="text-sm">{summary}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-primary">
                 {course.actualPrice && (
                    <span className="text-muted-foreground line-through flex items-center">
                        <IndianRupee className="h-4 w-4" />{course.actualPrice}
                    </span>
                  )}
                  <span className="text-accent flex items-center font-bold text-base">
                    <Tag className="h-4 w-4 mr-1" />
                    <IndianRupee className="h-4 w-4" />{course.discountPrice}
                  </span>
            </div>
        </div>
        <EnrollModal>
          <Button className="w-full">Enroll Now</Button>
        </EnrollModal>
      </CardFooter>
    </Card>
  );
}
