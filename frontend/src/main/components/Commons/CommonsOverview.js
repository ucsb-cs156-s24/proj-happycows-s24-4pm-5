import React, {useState, useEffect } from "react";
import { Row, Card, Col, Button} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";
import { daysSinceTimestamp } from "main/utils/dateUtils";
import axios from 'axios';

export default function CommonsOverview({ commonsPlus, currentUser }) {

    let navigate = useNavigate();
    // Stryker disable next-line all
    const leaderboardButtonClick = () => { navigate("/leaderboard/" + commonsPlus.commons.id) };
    const showLeaderboard = (hasRole(currentUser, "ROLE_ADMIN") || commonsPlus.commons.showLeaderboard );
    // Stryker disable next-line all
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const commonsId = commonsPlus.commons.id;
    useEffect(() => {
        setLoading(true);
        setError('');  // Clear previous error state before new request
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/announcements/getbycommonsid?commonsId=${commonsId}`);
                setAnnouncements(response.data);
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
                setError('Failed to load announcements');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [commonsId]);


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
                </Row>
                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <p>Loading announcements...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : announcements.length > 0 ? (
                        <Row>
                            <Col>
                                {announcements.map((announcement, index) => (
                                    <Card key={index}>
                                        <Card.Header>Announcement {index + 1}</Card.Header>
                                        <Card.Body>{announcement.announcementText}</Card.Body>
                                    </Card>
                                ))}
                            </Col>
                        </Row>
                    ) : (
                        <Row>
                            <Col>
                                <p>No announcements available.</p>
                            </Col>
                        </Row>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}; 