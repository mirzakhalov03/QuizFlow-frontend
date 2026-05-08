import QuizHeader from "@/components/main/quizzes/header"
 
export default function Quizzes() {

  
 
  return (
    <div className="space-y-6">
      <QuizHeader/>

      <div className="border-border text-muted-foreground rounded-lg border p-4 text-sm sm:p-6">
        No quizzes yet.
      </div>
    </div>
  )
}
