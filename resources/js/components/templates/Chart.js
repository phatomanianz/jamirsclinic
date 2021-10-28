import React, { PureComponent } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

const data = [
    {
        name: "January",
        Sales: 4000,
        Profit: 2400
    },
    {
        name: "February",
        Sales: 3000,
        Profit: 1398
    },
    {
        name: "March",
        Sales: 2000,
        Profit: 9800
    },
    {
        name: "April",
        Sales: 2780,
        Profit: 3908
    },
    {
        name: "May",
        Sales: 1890,
        Profit: 4800
    },
    {
        name: "June",
        Sales: 2390,
        Profit: 3800
    },
    {
        name: "July",
        Sales: 3490,
        Profit: 4300
    },
    {
        name: "August",
        Sales: 2780,
        Profit: 3908
    },
    {
        name: "September",
        Sales: 1890,
        Profit: 4800
    },
    {
        name: "October",
        Sales: 2390,
        Profit: 3800
    },
    {
        name: "November",
        Sales: 3490,
        Profit: 4300
    },
    {
        name: "December",
        Sales: 3490,
        Profit: 4300
    }
];

export default class Example extends PureComponent {
    render() {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Sales" fill="#82ca9d" />
                    <Bar dataKey="Profit" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}
