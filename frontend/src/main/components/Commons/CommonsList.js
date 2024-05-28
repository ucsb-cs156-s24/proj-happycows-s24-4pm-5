import React from "react";
import CommonsCard from "./CommonsCard";
import { Card, Container, Row, Col } from "react-bootstrap";

const CommonsList = (props) => {
    const defaultMessage = props.title?.includes("Join") ? "join" : "visit";
    // Stryker disable next-line all: don't test CSS params
    function getRandomColor() {
        // Stryker disable next-line all: don't test CSS params
        const red = Math.floor(Math.random() * 256);    
        // Stryker disable next-line all: don't test CSS params
        const green = Math.floor(Math.random() * 256);
        // Stryker disable next-line all: don't test CSS params 
        const blue = Math.floor(Math.random() * 256);
        // Stryker disable next-line all: don't test CSS params
        return `rgba(${red}, ${green}, ${blue},0.3)`; 
    }
    

    return (
        <Card
            style={
                // Stryker disable next-line all: don't test CSS params
                { opacity: ".9",boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"}
            }
            className="my-3 border-0"
        >
            <Card.Title
                data-testid="commonsList-title"
                style={
                    // Stryker disable next-line all: don't test CSS params
                    { fontSize: "35px" }
                }
                className="text-center my-3"
            >
                {props.title}
            </Card.Title>
            {props.commonList.length > 0 ? 
            <React.Fragment>
                <Card.Subtitle>
                    <Container>
                        <Row>
                            <Col data-testid="commonsList-subtitle-name" sx={4}>Common's Name</Col>
                            <Col sm={4}></Col>
                        </Row>
                    </Container>
                </Card.Subtitle>
                {
                    props.commonList.map(
                        
                        (c) => (<CommonsCard key={c.id} commons={c} buttonText={props.buttonText} buttonLink={props.buttonLink} color={getRandomColor()}/>)
                    )
                }
            </React.Fragment> 
            : 
            <Card.Subtitle>
                <Container>
                    <Row style={{justifyContent: "center"}} data-testid="commonsList-default-message">
                        There are currently no commons to {defaultMessage}
                    </Row>
                </Container>
            </Card.Subtitle>
        }
        </Card>
    );
};

export default CommonsList;