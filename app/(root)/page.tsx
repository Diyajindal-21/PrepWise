"use client";

import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import { toast } from "sonner";

const Page = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userInterviews, setUserInterviews] = useState<any[]>([]);
  const [latestInterviews, setLatestInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (user?.uid) {
        try {
          const [userIntvs, latestIntvs] = await Promise.all([
            getInterviewsByUserId(user.uid),
            getLatestInterviews({ userId: user.uid })
          ]);
          setUserInterviews(userIntvs || []);
          setLatestInterviews(latestIntvs || []);
        } catch (error) {
          console.error("Error fetching interviews:", error);
        }
      }
    };
    
    fetchInterviews();
  }, [user]);

  const handleStartInterview = async () => {
    try {
      if (!user) {
        toast.error("Please sign in to start an interview");
        await router.push("/sign-in");
        return;
      }
      await router.push("/interview");
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions & get instant feedback
          </p>
          <Button 
            onClick={handleStartInterview} 
            className="btn-primary max-sm:w-full"
          >
            Start an Interview
          </Button>
        </div>
        <Image 
          src="/robot.png" 
          alt="robo-dude" 
          width={400} 
          height={400} 
          className="max-sm:hidden"
        />
      </section>

      {user && !loading && (
        <>
          <section className="flex flex-col gap-6 mt-8">
            <h2>Your Interviews</h2>
            <div className="interviews-section">
              {userInterviews.length > 0 ? (
                userInterviews.map((interview) => (
                  <InterviewCard {...interview} key={interview.id} />
                ))
              ) : (
                <p>You haven't taken any interviews yet</p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-6 mt-8">
            <h2>Take an Interview</h2>
            <div className="interviews-section">
              {latestInterviews.length > 0 ? (
                latestInterviews.map((interview) => (
                  <InterviewCard {...interview} key={interview.id} />
                ))
              ) : (
                <p>There are no new interviews available</p>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Page;