import React from "react";
import ProfileFlowPage from "@/components/dashboard/profile/ProfileFlowPage";
import { adminProfileConfig } from "@/components/dashboard/profile/profileFlowConfigs";

const Profile = () => <ProfileFlowPage {...adminProfileConfig} />;

export default Profile;
