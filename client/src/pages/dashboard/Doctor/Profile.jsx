import React from "react";
import ProfileFlowPage from "@/components/dashboard/profile/ProfileFlowPage";
import { doctorProfileConfig } from "@/components/dashboard/profile/profileFlowConfigs";

const Profile = () => <ProfileFlowPage {...doctorProfileConfig} />;

export default Profile;
