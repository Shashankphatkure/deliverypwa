"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

const DashboardStats = dynamic(() => import("./components/DashboardStats"), {
  ssr: false,
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const dashboardCards = [
    {
      title: "Stores",
      link: "/dashboard/stores",
      description: "Manage stores and restaurants",
      icon: BuildingStorefrontIcon,
    },
    {
      title: "Menu Items",
      link: "/dashboard/items",
      description: "Manage food items and pricing",
      icon: ShoppingBagIcon,
    },
    {
      title: "Orders",
      link: "/dashboard/orders",
      description: "Manage and track orders",
      icon: HomeIcon,
    },
    {
      title: "Drivers",
      link: "/dashboard/drivers",
      description: "Manage delivery personnel",
      icon: TruckIcon,
    },
    {
      title: "Customers",
      link: "/dashboard/customers",
      description: "Manage customers",
      icon: UserGroupIcon,
    },
    {
      title: "Penalties",
      link: "/dashboard/penalties",
      description: "Manage driver penalties",
      icon: ExclamationTriangleIcon,
    },
    {
      title: "Payments",
      link: "/dashboard/payments",
      description: "Process driver payments",
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Dashboard Overview
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <DashboardStats />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {dashboardCards.map((card, index) => (
          <motion.div key={card.title} variants={item}>
            <DashboardCard
              title={card.title}
              link={card.link}
              description={card.description}
              Icon={card.icon}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function DashboardCard({ title, link, description, Icon }) {
  return (
    <motion.a
      href={link}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="block p-6 rounded-xl backdrop-blur-lg bg-white/80 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center mb-3">
        <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold ml-3 text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-600">{description}</p>
    </motion.a>
  );
}
