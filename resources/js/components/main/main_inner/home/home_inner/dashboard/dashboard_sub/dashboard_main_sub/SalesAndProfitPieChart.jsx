import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

function SalesAndProfitPieChart(props) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={props.data} outerRadius={80} dataKey="value" label>
                    <Cell key="Sales" fill="#82ca9d" />
                    <Cell key="Profit" fill="#8884d8" />
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

export default SalesAndProfitPieChart;
