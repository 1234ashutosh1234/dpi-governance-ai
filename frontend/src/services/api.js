import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDistrictAnalytics = async (district) => {
  const response = await API.get(
    `/analytics/district/${district}`
  );

  return response.data;
};

export const getHotspots = async (district) => {
  const response = await API.get(
    `/hotspots/district/${district}`
  );

  return response.data;
};

export const getRecommendation = async (
  district,
  category
) => {
  const response = await API.get(
    `/recommendations/district/${district}/category/${encodeURIComponent(
      category
    )}`
  );

  return response.data;
};

export default API;