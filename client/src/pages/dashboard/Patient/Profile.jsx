import React from "react";
import ProfileFlowPage from "@/components/dashboard/profile/ProfileFlowPage";
import { patientProfileConfig } from "@/components/dashboard/profile/profileFlowConfigs";

const Profile = () => <ProfileFlowPage {...patientProfileConfig} />;

export default Profile;
