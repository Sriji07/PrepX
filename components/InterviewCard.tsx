
import dayjs from 'dayjs';
import React from 'react';
import Image from 'next/image';
import { cn, getRandomInterviewCover } from "@/lib/utils";
import { Button } from './ui/button';
import Link from 'next/link';
//import DisplayTechIcons from './DisplayTechIcons';
//import { getFeedbackByInterviewId } from "@/lib/actions/general.action";


interface InterviewCardProps {
    interviewId: string;
    userId: string;
    role: string;
    type: string;
    techstack: string;
    createdAt: string;
}

const InterviewCard = ({ interviewId, userId, role, type, techstack, createdAt }: InterviewCardProps) => {
    const feedback = null as Feedback | null;
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format("MMM D, YYYY");
    function getRandomInterviewCover() {
        const ids = [
            "photo-1518770660439-4636190af455",
            "photo-1498050108023-c5249f4df085",
            "photo-1517433456452-f9633a875f6f",
            "photo-1526378722484-d90c8c9f7b31",
            "photo-1504384308090-c894fdcc538d",
            "photo-1519389950473-47ba0277781c",
        ];

        const id = ids[Math.floor(Math.random() * ids.length)];

        return `https://images.unsplash.com/${id}?ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80`;
    }



    return (
        <div className="relative w-[360px] max-sm:w-full min-h-[24rem] rounded-2xl border border-slate-600 bg-gradient-to-b from-slate-800 to-slate-900 p-6">
            {/* Top area: badge + avatar/cover */}
            <div className="relative">
                {/* badge in top-right */}
                <div className="absolute top-0 right-0 px-4 py-2 rounded-bl-lg bg-slate-700/60">
                    <p className="text-sm font-medium text-slate-100">{normalizedType}</p>
                </div>

                {/* cover/avatar top-left */}
                <div className="w-[90px] h-[90px]">
                    <Image
                        src={getRandomInterviewCover()}
                        alt="cover-image"
                        width={90}
                        height={90}
                        className="rounded-full object-cover w-[90px] h-[90px]"
                    />
                </div>
            </div>

            {/* Title */}
            <h3 className="mt-5 text-2xl font-semibold capitalize text-white">
                {role} Interview
            </h3>

            {/* meta row */}
            <div className="flex flex-row gap-6 mt-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                    <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                    <p>{formattedDate}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Image src="/star.svg" alt="star" width={22} height={22} />
                    <p>{feedback?.totalScore ?? "---"}/100</p>
                </div>
            </div>

            {/* description */}
            <p className="line-clamp-2 mt-5 text-slate-300">
                {feedback?.finalAssessment ??
                    "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>

            {/* footer: tech icons + CTA */}
            <div className="mt-6 flex items-center justify-between">
                {/* <DisplayTechIcons techStack={techstack} /> */}

                {/* Prefer Link with button styles so it renders as a single clickable element */}
                <Link
                    href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}
                    className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium btn-primary"
                >
                    {feedback ? "Check Feedback" : "View Interview"}
                </Link>
            </div>
        </div>
    );
}

export default InterviewCard