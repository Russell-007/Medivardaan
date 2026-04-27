"use client";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users, Activity, DivideSquare, DivideCircle } from "lucide-react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Pie,
    PieChart,
    Cell,
    BarChart,
    Bar,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import { setParameterType } from "@/store/slices/parameterType";
import { setHeaderData } from "@/store/slices/headerSlice";
import { useDispatch } from "react-redux";
// import { dashboardCount } from "@/api/client/dashboardCount";
import { useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
} from "@tanstack/react-table";
import GenericTable from "@/components/common/GenericTable";
import { Spinner } from "@/components/ui/spinner";
import { TableWrapper } from "@/components/shared/TableWrapper";
import { useUser } from "@/hooks/useUser";
// import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
    const [region, setRegion] = useState("0");
    const [period, setPeriod] = useState("All");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter(); // ✅ Initialize router
    const user = useUser();

    // Detect dark mode by watching the 'dark' class on <html>
    useEffect(() => {
        const root = document.documentElement;
        setIsDarkMode(root.classList.contains("dark"));
        const observer = new MutationObserver(() => {
            setIsDarkMode(root.classList.contains("dark"));
        });
        observer.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Chart colors: purple in dark mode, teal in light mode
    const chartColor = isDarkMode ? "#9D8EC5" : "#4DB8AC";
    const tooltipBg = isDarkMode ? "#18122B" : "#ffffff";
    const tooltipBorder = isDarkMode ? "#635985" : "#d1d5db";
    const tooltipText = isDarkMode ? "#ffffff" : "#111827";
    const tooltipLabel = isDarkMode ? "#9D8EC5" : "#4DB8AC";
    const axisTickColor = isDarkMode ? "#9ca3af" : "#4b5563";
    const gridStroke = isDarkMode ? "#d4c3db" : "#c3d6db";

    let userDetails = user;

    const UserID = userDetails?.userData?.userId;
    const UserRole = userDetails?.userData?.roleName;

    // const { data, isLoading, error } = useDashboardData(region, UserID);
    const data = [];
    const isLoading = false;
    const error = null;

    // const { data:dashCountData, isLoading:dashLoading, isError, error:dashError } = useQuery({
    //     queryKey: ["dashboardCount",region,UserID,period],
    //      queryFn: () =>
    //    dashboardCount.getDashboardCountData(
    //       region,
    //       UserID,
    //       period
    //     ),
    //   enabled: !!region && !!UserID && !!period,
    //     // staleTime: 1000 * 60 * 5, // optional cache time (5 mins)
    //   });

    const dashCountData = [];
    const dashLoading = false;
    const isError = false;
    const dashError = null;

    let cardsData = dashCountData?.[0]?.dashboardCounts?.[0];

    let piechartData = dashCountData?.[0]?.paiCharts;

    const dispatch = useDispatch();

    const groupedData = [
        {
            parameter: "Patients",
            D1: "124",
            W1: "560",
            M1: "2400",
            Q1: "7200",
            Y1: "28800",
        },
        {
            parameter: "Procedures",
            D1: "89",
            W1: "400",
            M1: "1700",
            Q1: "5100",
            Y1: "20400",
        },
        {
            parameter: "Revenue",
            D1: "₹2.8L",
            W1: "₹12.5L",
            M1: "₹50L",
            Q1: "₹1.5Cr",
            Y1: "₹6Cr",
        },
        {
            parameter: "Revenue / Patient",
            D1: "₹2,250",
            W1: "₹2,232",
            M1: "₹2,083",
            Q1: "₹2,083",
            Y1: "₹2,000",
        },
        {
            parameter: "Revenue / Procedure",
            D1: "₹3,150",
            W1: "₹3,125",
            M1: "₹2,941",
            Q1: "₹2,941",
            Y1: "₹2,941",
        },
    ];

    const invoices = [
        {
            branch: "East",
            patients: "45",
            procedures: "28",
            turnover: "₹1.2L",
            expenditure: "₹0.5L",
            inventory: "₹0.3L",
        },
        {
            branch: "West",
            patients: "30",
            procedures: "25",
            turnover: "₹0.9L",
            expenditure: "₹0.4L",
            inventory: "₹0.2L",
        },
        {
            branch: "North",
            patients: "25",
            procedures: "20",
            turnover: "₹0.5L",
            expenditure: "₹0.3L",
            inventory: "₹0.15L",
        },
        {
            branch: "South",
            patients: "24",
            procedures: "16",
            turnover: "₹0.2L",
            expenditure: "₹0.2L",
            inventory: "₹0.1L",
        },
    ];

    const periods = [
        { id: "Yesterday", label: "Yesterday" },
        { id: "days7", label: "Last 7 Days" },
        { id: "days30", label: "30 Days" },
        { id: "days90", label: "90 Days" },
        { id: "days365", label: "365 Days" },
        { id: "All", label: "Grouped" },
    ];

    const statCards = [
        {
            title: "Patients",
            value: "124",
            key: "patients",
            icon: (
                <Users className="w-5 h-5 text-medivardaan-teal-light dark:text-medivardaan-purple-light/80" />
            ),
        },
        {
            title: "Procedures",
            value: "89",
            key: "procedures",
            icon: (
                <Activity className="w-5 h-5 text-medivardaan-teal-light dark:text-medivardaan-purple-light/80" />
            ),
        },
        {
            title: "Revenue",
            value: "₹ 2.8L",
            key: "revenue",
            icon: (
                <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
            ),
        },
        {
            title: "Revenue / Patient",
            value: "₹ 2,250",
            key: "revenuePatient",
            icon: (
                <DivideSquare className="w-5 h-5 text-medivardaan-blue dark:text-medivardaan-blue/80" />
            ),
        },
        {
            title: "Revenue / Procedure",
            value: "₹ 3,150",
            key: "revenueProcedure",
            icon: (
                <DivideCircle className="w-5 h-5 text-medivardaan-blue dark:text-medivardaan-blue/80" />
            ),
        },
    ];

    // Dummy data for charts
    const revenueGrowthData = [
        { month: "Jan", revenue: 40000 },
        { month: "Feb", revenue: 45000 },
        { month: "Mar", revenue: 47000 },
        { month: "Apr", revenue: 52000 },
        { month: "May", revenue: 58000 },
        { month: "Jun", revenue: 60000 },
        { month: "Jul", revenue: 65000 },
        { month: "Aug", revenue: 63000 },
        { month: "Sep", revenue: 68000 },
        { month: "Oct", revenue: 71000 },
    ];

    const revenueBreakupData = [
        { name: "General", value: 30000 },
        { name: "Braces", value: 45000 },
        { name: "Implants", value: 15000 },
        { name: "Aligners", value: 25000 },
    ];

    // Memoize formatted piechart data to prevent recalculation on every render
    const formatted = useMemo(() => {
        return piechartData?.map((item) => ({
            name: item?.groupName,
            value: Number(item?.revenue),
        }));
    }, [piechartData]);

    const COLORS = [
        "var(--medivardaan-teal-light)",
        "var(--medivardaan-blue)",
        "#22c55e",
        "#f59e0b",
    ];

    const inventorySummaryData = [
        { name: "Medicines", value: 520 },
        { name: "Equipment", value: 450 },
        { name: "Supplies", value: 200 },
        { name: "Consumables", value: 100 },
    ];

    // Memoize total revenue calculation
    const totalRevenue = useMemo(() => {
        return revenueBreakupData.reduce((sum, item) => sum + item.value, 0);
    }, [revenueBreakupData]);

    // Memoize columns to prevent recreation on every render
    const columns = useMemo(
        () => [
            {
                accessorKey: "rpl",
                header: "",
                cell: ({ row }) => (
                    <span
                        onClick={() => {
                            router.push(
                                `/dashboard/admin/parameters/${row.original.type}`,
                            );
                            dispatch(
                                setParameterType({
                                    parameterName: row.original.rpl,
                                    parameterTypeId: row.original.type,
                                }),
                            );
                        }}
                        className="underline text-medivardaan-blue dark:text-medivardaan-purple-light hover:text-medivardaan-teal-light dark:hover:text-medivardaan-blue hover:cursor-pointer"
                    >
                        {row.original.rpl}
                    </span>
                ),
            },
            ...[
                "d1",
                "d2",
                "w1",
                "w2",
                "m1",
                "m2",
                "q1",
                "q2",
                "y1",
                "y2",
                "w1W2",
                "m1M2",
                "q1Q2",
                "y1Y2",
            ].map((key) => ({
                accessorKey: key,
                header:
                    key.includes("W2") ||
                    key.includes("M2") ||
                    key.includes("Q2") ||
                    key.includes("Y2")
                        ? key.replace(/(\d)([a-zA-Z])/g, "$1/$2").toUpperCase() // Fix the format: insert slash between number and letter
                        : key.toUpperCase(), // Other key
                cell: ({ getValue }) => {
                    const val = getValue();
                    return val ? Number(val).toLocaleString("en-IN") : "-";
                },
                sortingFn: "alphanumeric",
            })),
        ],
        [router, dispatch],
    );

    if (isLoading || dashLoading)
        return (
            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spinner />
            </div>
        );
    if (error || dashError)
        return (
            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                Error: {error.message}
            </div>
        );

    return (
        <div className="min-h-screen">
            {/* Header */}
            {/* Header (Fixed) */}
            <header className="w-full bg-gradient-to-r from-[#4DB8AC]/10 via-[#1E6B8C]/10 to-[#4DB8AC]/10 dark:bg-gradient-to-r dark:from-[#393053] dark:via-[#443C68] dark:to-[#393053] border border-[#4DB8AC]/20 dark:border-[#443C68] rounded-lg shadow-sm px-6 py-4 mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Section */}
                {/* <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-[#635985]" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
      </div> */}

                {/* Right Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-end">
                    {/* Region Selector */}
                    <Select
                        onValueChange={(value) => {
                            setRegion(value);
                            dispatch(
                                setHeaderData({ region: value, period: null }),
                            );
                        }}
                        value={region}
                    >
                        <SelectTrigger className="w-[160px] bg-gradient-to-br from-[#4DB8AC]/5 to-[#1E6B8C]/5 dark:bg-gradient-to-br dark:from-[#393053] dark:to-[#443C68] border border-[#4DB8AC]/30 dark:border-[#635985]/40 rounded-md text-sm font-medium dark:text-white">
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                { regionName: "All", regionValue: "0" },
                                { regionName: "East", regionValue: "1" },
                                { regionName: "West", regionValue: "2" },
                                { regionName: "North", regionValue: "3" },
                                { regionName: "South", regionValue: "4" },
                                { regionName: "Central", regionValue: "5" },
                            ].map((r) => (
                                <SelectItem
                                    key={r.regionValue}
                                    value={r.regionValue}
                                >
                                    {r.regionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Period Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {periods.map((p) => (
                            <Button
                                key={p.id}
                                size="sm"
                                variant={
                                    period === p.id ? "default" : "outline"
                                }
                                onClick={() => {
                                    setPeriod(p.id);
                                    dispatch(
                                        setHeaderData({
                                            region: null,
                                            period: p.id,
                                        }),
                                    );
                                }}
                                className={`rounded-full px-4 ${period === p.id ? "bg-primary hover:bg-primary/90 dark:text-white" : "text-primary border-primary hover:bg-primary/10 dark:text-white dark:border-[#5B4F8A]"}`}
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>

                    {/* Logout */}
                </div>
            </header>
            {period !== "All" ? (
                <div className="pt-20 space-y-8">
                    {/* Stats Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {statCards.map((item) => {
                            const stats = cardsData;

                            const value = stats?.[item?.key];
                            return (
                                <Card
                                    key={item.title}
                                    className="card-gradient text-center shadow-md hover:shadow-xl transition-all"
                                >
                                    <CardContent className="p-5 flex flex-col items-center space-y-2">
                                        <div>{item.icon}</div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60">
                                            {item.title}
                                        </p>
                                        <h2 className="text-l whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            {" "}
                                            {item.key.includes("revenue")
                                                ? `₹ ${Number(value).toLocaleString("en-IN")}`
                                                : value}
                                        </h2>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </section>

                    {/* Revenue Charts */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Growth - Line Chart */}
                        <Card className="card-gradient p-0">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Revenue Growth
                                </h3>

                                <div className="h-60">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart data={revenueGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fill: axisTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: gridStroke }}
                                                tickLine={{ stroke: gridStroke }}
                                            />
                                            <YAxis
                                                tick={{ fill: axisTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: gridStroke }}
                                                tickLine={{ stroke: gridStroke }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: tooltipBg,
                                                    border: `1px solid ${tooltipBorder}`,
                                                    borderRadius: "8px",
                                                    color: tooltipText,
                                                }}
                                                labelStyle={{ color: tooltipLabel, fontWeight: 600 }}
                                                itemStyle={{ color: tooltipText }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke={chartColor}
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
                                                activeDot={{ r: 6, fill: chartColor }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue Breakup - Pie Chart */}
                        <Card className="card-gradient p-0">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Revenue Breakup
                                </h3>
                                <div className="h-60 flex items-center justify-center">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={formatted}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, value }) =>
                                                    `${name}: ₹${value.toLocaleString("en-IN")}`
                                                } // ✅ formatted label
                                            >
                                                {formatted?.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                COLORS[
                                                                    index %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Legend />
                                            <Tooltip
                                                formatter={(value) =>
                                                    `₹` +
                                                    value.toLocaleString(
                                                        "en-IN",
                                                    )
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Inventory & Expenditure */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Inventory Summary - Bar Chart */}
                        <Card className="card-gradient p-0">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Inventory Consumption
                                </h3>
                                <div className="h-60">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={inventorySummaryData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: axisTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: gridStroke }}
                                                tickLine={{ stroke: gridStroke }}
                                            />
                                            <YAxis
                                                tick={{ fill: axisTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: gridStroke }}
                                                tickLine={{ stroke: gridStroke }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: tooltipBg,
                                                    border: `1px solid ${tooltipBorder}`,
                                                    borderRadius: "8px",
                                                    color: tooltipText,
                                                }}
                                                labelStyle={{ color: tooltipLabel, fontWeight: 600 }}
                                                itemStyle={{ color: tooltipText }}
                                            />
                                            <Bar
                                                dataKey="value"
                                                fill={chartColor}
                                                radius={[5, 5, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expenditure Breakdown - Table */}
                        <Card className="card-gradient p-0">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Expenditure Breakdown
                                </h3>
                                <TableWrapper>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="py-2">Heading</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-left">
                                            <td className="py-2">Utilities</td>
                                            <td>₹25,000</td>
                                        </tr>
                                        <tr className="text-left">
                                            <td className="py-2">Equipment</td>
                                            <td>₹40,000</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2">Staff Salaries</td>
                                            <td>₹1,20,000</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </TableWrapper>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Branch Summary */}
                    <Card className="bg-white/80 dark:bg-[#393053]/70 backdrop-blur-sm border dark:border-white/20 p-0 w-full">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Branch Summary
                            </h3>
                            {/* <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Branch</th>
                <th>Patients</th>
                <th>Procedures</th>
                <th>Turnover</th>
                <th>Expenditure</th>
                <th>Inventory</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>East</td><td>45</td><td>28</td><td>₹1.2L</td><td>₹0.5L</td><td>₹0.3L</td></tr>
              <tr><td>West</td><td>30</td><td>25</td><td>₹0.9L</td><td>₹0.4L</td><td>₹0.2L</td></tr>
              <tr><td>North</td><td>25</td><td>20</td><td>₹0.5L</td><td>₹0.3L</td><td>₹0.15L</td></tr>
              <tr><td>South</td><td>24</td><td>16</td><td>₹0.2L</td><td>₹0.2L</td><td>₹0.1L</td></tr>
            </tbody>
          </table> */}
                            <TableWrapper contentClassName="p-0 border border-black/40 dark:border-white/40">
                                <Table className="overflow-x-auto border-0">
                                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                                    <TableHeader>
                                        <TableRow className="bg-primary/20 hover:bg-primary/20 border-b-2 border-black/40 dark:border-white/40">
                                            <TableHead className="w-[100px]">
                                                Branch
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Patients
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Procedures
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Turnover
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Expenditure
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Inventory
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice, index) => (
                                            <TableRow
                                                key={index}
                                                className="border-b border-black/20 dark:border-white/20"
                                            >
                                                <TableCell className="font-medium">
                                                    {invoice.branch}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.patients}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.procedures}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.turnover}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.expenditure}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.inventory}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter className=" border-black/40 dark:border-white/40">
                                        <TableRow>
                                            <TableCell colSpan={3}>Total</TableCell>
                                            <TableCell className="text-right">
                                                ₹2.8L
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ₹1.4L
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ₹0.75L
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableWrapper>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="pt-5 space-y-8">
                    <Card className="card-gradient p-0">
                        <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
                                Overall Summary
                            </h3>

                            <GenericTable
                                data={period === "All" ? data || [] : []}
                                columns={columns}
                                showSorting={false}
                                borderColorClass="border-medivardaan-teal-light/50 dark:border-medivardaan-purple-light/70"
                                paginationButtonClass="border-black dark:border-white"
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
