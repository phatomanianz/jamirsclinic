import React from "react";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    Label,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

function SalesAndProftBarChart(props) {
    const isMobileScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));

    return (
        <ResponsiveContainer width="100%" height="100%">
            {isMobileScreen ? (
                <BarChart
                    data={props.data}
                    layout="vertical"
                    margin={{ left: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Sales" fill="#82ca9d" />
                    <Bar dataKey="Profit" fill="#8884d8" />
                </BarChart>
            ) : (
                <BarChart data={props.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name">
                        <Label
                            value="Months"
                            offset={0}
                            position="insideBottom"
                        />
                    </XAxis>
                    <YAxis
                        label={{
                            value: "Amount",
                            angle: -90,
                            position: "insideLeft",
                            textAnchor: "middle"
                        }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Sales" fill="#82ca9d" />
                    <Bar dataKey="Profit" fill="#8884d8" />
                </BarChart>
            )}
        </ResponsiveContainer>
    );
}

export default SalesAndProftBarChart;
