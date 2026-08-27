import { auth, defineMcp } from "@lovable.dev/mcp-js";

import searchCustomersTool from "./tools/search_customers";
import getCustomerTool from "./tools/get_customer";
import createCustomerTool from "./tools/create_customer";
import updateCustomerTool from "./tools/update_customer";
import deleteCustomerTool from "./tools/delete_customer";
import listOrdersTool from "./tools/list_orders";
import createOrderTool from "./tools/create_order";
import updateOrderTool from "./tools/update_order";
import deleteOrderTool from "./tools/delete_order";
import getDashboardSummaryTool from "./tools/get_dashboard_summary";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "plastics-admin-panel",
  title: "Plastics Admin Panel",
  version: "0.1.0",
  instructions:
    "Tools untuk mengelola customer dan order Our Plastics. Gunakan search_customers untuk mencari customer, get_customer untuk detail, dan tool create/update/delete untuk mengubah data. Semua data di-scope ke user yang terautentikasi.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchCustomersTool,
    getCustomerTool,
    createCustomerTool,
    updateCustomerTool,
    deleteCustomerTool,
    listOrdersTool,
    createOrderTool,
    updateOrderTool,
    deleteOrderTool,
    getDashboardSummaryTool,
  ],
});
