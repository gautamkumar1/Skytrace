"use client";

import AnalysisForm from "@/components/cases/AnalysisForm";
import Header from "@/components/layout/Header";

export default function NewAnalysisPage() {
    return (
        <>
            <Header 
                title="New Analysis" 
                subtitle="Ingest documents and run AI due diligence agents"
            />
            <div className="mt-8">
                <AnalysisForm />
            </div>
        </>
    );
}
