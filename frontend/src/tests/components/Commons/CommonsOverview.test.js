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
        
        axiosMock.onGet("/api/announcement/all").reply(200,);
        expect(axiosMock.history.get.length).toEqual(1);
        expect(screen.queryByText("Announcement 1")).not.toBeInTheDocument();

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
        expect(screen.queryByText("Announcement 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Announcement 2")).not.toBeInTheDocument();
        expect(screen.queryByText("Announcement 3")).not.toBeInTheDocument();
        announcementFixtures.threeAnnouncements.forEach(announcement => {
            expect(screen.queryByText(announcement.announcementText)).not.toBeInTheDocument();
        });
    });

    test('displays announcements when available and handles empty announcements', async () => {
        // Setup with announcements
        axiosMock.onGet("/api/announcements/getbycommonsid?commonsId=4").reply(200, announcementFixtures.threeAnnouncements);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CommonsOverview commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]} currentUser={apiCurrentUserFixtures.adminUser.user} />
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        // Check that all announcements are displayed
        await waitFor(() => {
            announcementFixtures.threeAnnouncements.forEach(announcement => {
                expect(screen.getByText(announcement.announcementText)).toBeInTheDocument();
            });
        });
    
        // Setup with no announcements
        axiosMock.onGet("/api/announcements/getbycommonsid?commonsId=4").reply(200, []);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CommonsOverview commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]} currentUser={apiCurrentUserFixtures.adminUser.user} />
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        await waitFor(() => {
            expect(screen.getByText("No announcements available.")).toBeInTheDocument();
        });
    });

    test('handles boundary conditions for announcements display', async () => {
        // Assuming an impossible negative case might be mutated
        const negativeAnnouncementMock = {
            ...announcementFixtures.threeAnnouncements,
            length: -1
        };
    
        axiosMock.onGet("/api/announcements/getbycommonsid?commonsId=4").reply(200, negativeAnnouncementMock);
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CommonsOverview commonsPlus={commonsPlusFixtures.oneCommonsPlus[0]} currentUser={apiCurrentUserFixtures.adminUser.user} />
                </MemoryRouter>
            </QueryClientProvider>
        );
    
        // Check for correct handling of unexpected data
        await waitFor(() => {
            expect(screen.getByText("No announcements available.")).toBeInTheDocument();
        });
    });
    
});