import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import CommonsOverview from "main/components/Commons/CommonsOverview";
import PlayPage from "main/pages/PlayPage";
import commonsFixtures from "fixtures/commonsFixtures"; 
import leaderboardFixtures from "fixtures/leaderboardFixtures";
import { announcementFixtures } from "fixtures/announcementFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: 1
    }),
    useNavigate: () => mockNavigate
}));

describe("CommonsOverview tests", () => {

    const queryClient = new QueryClient();
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/announcements/getbycommonsid?commonsId=4").reply(200, announcementFixtures.threeAnnouncements);
    });


    test("renders without crashing", () => {
        render(
            <CommonsOverview commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]} />
        );
    });

    test("Redirects to the LeaderboardPage for an admin when you click visit", async () => {
        apiCurrentUserFixtures.adminUser.user.commons = commonsFixtures.oneCommons[0];
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/commons/plus", {params: {id:1}}).reply(200, commonsPlusFixtures.oneCommonsPlus[0]);
        axiosMock.onGet("/api/leaderboard/all").reply(200, leaderboardFixtures.threeUserCommonsLB);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(axiosMock.history.get.length).toEqual(5);
        });
        expect(await screen.findByTestId("user-leaderboard-button")).toBeInTheDocument();
        const leaderboardButton = screen.getByTestId("user-leaderboard-button");
        fireEvent.click(leaderboardButton);
        //expect(mockNavigate).toBeCalledWith({ "to": "/leaderboard/1" });
    });

    test("No LeaderboardPage for an ordinary user when commons has showLeaderboard = false", async () => {
        const ourCommons = {
            ...commonsFixtures.oneCommons,
            showLeaderboard : false
        };
        const ourCommonsPlus = {
            ...commonsPlusFixtures.oneCommonsPlus,
            commons : ourCommons
        }
        apiCurrentUserFixtures.userOnly.user.commonsPlus = commonsPlusFixtures.oneCommonsPlus[0];
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/plus", {params: {id:1}}).reply(200, ourCommonsPlus);
        axiosMock.onGet("/api/leaderboard/all").reply(200, leaderboardFixtures.threeUserCommonsLB);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(axiosMock.history.get.length).toEqual(5);
        });
        expect(() => screen.getByTestId("user-leaderboard-button")).toThrow();
        expect(screen.getByText("Failed to load announcements")).toBeInTheDocument();

    });

    test("Announcements show properly", async () => {
        apiCurrentUserFixtures.adminUser.user.commons = commonsFixtures.oneCommons[0];
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
        axiosMock.onGet("/api/commons/plus", {params: {id:1}}).reply(200, commonsPlusFixtures.oneCommonsPlus[0]);
        axiosMock.onGet("/api/announcement/all").reply(200, announcementFixtures.threeAnnouncements);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(axiosMock.history.get.length).toEqual(5);
        });
        expect(screen.getByText("Announcement 1")).toBeInTheDocument();
        expect(screen.getByText("Announcement 2")).toBeInTheDocument();
        expect(screen.getByText("Announcement 3")).toBeInTheDocument();
        announcementFixtures.threeAnnouncements.forEach(announcement => {
            expect(screen.getByText(announcement.announcementText)).toBeInTheDocument();
        });
    });

    test("No annoucementPage for an ordinary user when commons has showannoucement = false", async () => {
        const ourCommons = {
            ...commonsFixtures.oneCommons,
            showAnnouncements : false
        };
        const ourCommonsPlus = {
            ...commonsPlusFixtures.oneCommonsPlus,
            commons : ourCommons
        }
        apiCurrentUserFixtures.userOnly.user.commonsPlus = commonsPlusFixtures.oneCommonsPlus[0];
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/commons/plus", {params: {id:1}}).reply(200, ourCommonsPlus);
        axiosMock.onGet("/api/annoucement/all").reply(200, announcementFixtures.threeAnnouncements);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PlayPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(axiosMock.history.get.length).toEqual(5);
        });
        expect(screen.queryByText("Announcements")).not.toBeInTheDocument();
        announcementFixtures.threeAnnouncements.forEach(announcement => {
            expect(screen.queryByText(announcement.announcementText)).not.toBeInTheDocument();
        });
    });
});