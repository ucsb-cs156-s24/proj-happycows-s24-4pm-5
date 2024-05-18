
import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend} from "main/utils/useBackend";
import { useParams } from "react-router-dom";

export default function AdminAnnouncementsPage() {
    let { commonsId } = useParams();

    // Stryker disable all
    const { data: commonsPlus } = useBackend(
        [`/api/commons/plus?id=${commonsId}`],
        {
            method: "GET",
            url: "/api/commons/plus",
            params: {
                id: commonsId,
            },
        }
    );
    const commonsName = commonsPlus?.commons.name;

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Announcements for {commonsName}</h1>
            </div>
        </BasicLayout>
    )
    
}