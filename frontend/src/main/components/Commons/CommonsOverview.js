import React from "react";
import { Row, Card, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";
import { daysSinceTimestamp } from "main/utils/dateUtils";

export default function CommonsOverview({ commonsPlus, currentUser }) {

    let navigate = useNavigate();
    // Stryker disable next-line all
    const leaderboardButtonClick = () => { navigate("/leaderboard/" + commonsPlus.commons.id) };
    const showLeaderboard = (hasRole(currentUser, "ROLE_ADMIN") || commonsPlus.commons.showLeaderboard );
    // Stryker disable next-line all
    const announcementsButtonClick = () => { navigate("/announcements/" + commonsPlus.commons.id) };
    const showAnnouncements = (hasRole(currentUser, "ROLE_ADMIN") || commonsPlus.commons.showAnnouncements );
    return (
        <Card data-testid="CommonsOverview">
            <Card.Header as="h5">Common Overview</Card.Header>
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Title>Today is day {daysSinceTimestamp(commonsPlus.commons.startingDate)}!</Card.Title>
                        <Card.Text>Total Players: {commonsPlus.totalUsers}</Card.Text>
                    </Col>
                    <Col>
                        {showLeaderboard &&
                        (<Button variant="outline-success" data-testid="user-leaderboard-button" onClick={leaderboardButtonClick}>
                            Leaderboard
                        </Button>)}
                    </Col>
                    <Col>
                    {showAnnouncements &&
                        (<Button variant="outline-success" data-testid="user-announcements-button" onClick={announcementsButtonClick}>
                            Announcements
                        </Button>)}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}; 