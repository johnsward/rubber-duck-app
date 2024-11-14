import React from "react";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbCircleOutlinedIcon from '@mui/icons-material/LightbulbCircleOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "Rubber Ducking",
}: Readonly<HeaderProps>) => {
  return (
    <div className="flex flex-row justify-between align-middle p-4 border rounded-lg shadow-md">
      <h1 className="text-customGray text-xl">{title}</h1>

      <div className="flex flex-row gap-4">
        <div className="flex flex-row justify-center gap-2">
          <HelpOutlineIcon />
          <a href="" className="text-primaryColor hover:text-secondaryColor">
            How it works
          </a>
        </div>
        <div className="flex flex-row justify-center gap-2">
          <LightbulbCircleOutlinedIcon />
          <a href="" className="text-primaryColor hover:text-secondaryColor">
            Tips & Tricks
          </a>
        </div>
        <div className="flex flex-row justify-center gap-2">
          <FeedbackOutlinedIcon />
          <a href="" className="text-primaryColor hover:text-secondaryColor">
            Feedback
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
