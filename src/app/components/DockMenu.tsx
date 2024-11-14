"use client";
import { Dock, DockIcon } from "./ui/dock";
import React, { useState } from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import HomeOutlineIcon from "@mui/icons-material/HomeOutlined";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/joy/Divider";
import Link from "next/link";

const AppDock: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState(true);

  const handleThemeToggle = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <div className="relative">
      <Dock
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 shadow-md align-middle justify-center"
        magnification={60}
        distance={100}
        direction="middle"
      >
        <DockIcon>
          <Tooltip title="Home">
            <Link href="/">
              <div className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 hover:bg-gray-200">
                <HomeOutlineIcon className="text-primaryColor hover:text-blue-500 transition-colors duration-200" />
              </div>
            </Link>
          </Tooltip>
        </DockIcon>
        <Divider orientation="vertical" />
        <DockIcon>
          <Tooltip title="Help">
            <Link href="/help">
              <div className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 hover:bg-gray-200">
                <HelpOutlineIcon className="text-primaryColor" />
              </div>
            </Link>
          </Tooltip>
        </DockIcon>

        <DockIcon>
          <Tooltip title="Tips">
            <Link href="/tips">
              <div className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 hover:bg-gray-200">
                <LightbulbOutlinedIcon className="text-primaryColor text-center hover:text-secondaryColor transition-colors duration-200" />
              </div>
            </Link>
          </Tooltip>
        </DockIcon>

        <DockIcon>
          <Tooltip title="Feedback">
            <Link href="/feedback">
              <div className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 hover:bg-gray-200">
                <ErrorOutlineOutlinedIcon className="text-primaryColor hover:text-secondaryColor transition-colors duration-200" />
              </div>
            </Link>
          </Tooltip>
        </DockIcon>
        <Divider orientation="vertical" />
        <DockIcon>
          <Tooltip title={isLightMode ? "Light mode" : "Dark mode"}>
            <div
              onClick={handleThemeToggle}
              className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-200 hover:bg-gray-200"
            >
              {isLightMode ? (
                <LightModeOutlinedIcon className="text-primaryColor hover:text-yellow-500 transition-colors duration-200" />
              ) : (
                <DarkModeOutlinedIcon className="text-primaryColor hover:text-blue-800 transition-colors duration-200" />
              )}
            </div>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  );
};

export default AppDock;
