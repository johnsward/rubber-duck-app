import React, { useRef } from "react";
import SpeedDial, { SpeedDialProps } from "@mui/material/SpeedDial";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";

export const CustomSpeedDial: React.FC<SpeedDialProps> = (props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current?.click();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Rubber Ducking",
        text: "Check out this cool app!",
        url: window.location.href,
      });
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <>
      <SpeedDial
        ariaLabel="Actions"
        icon={<SpeedDialIcon />}
        FabProps={{
          color: "primary",
          sx: {
            width: 40, 
            height: 40,
            color: "#242424",
            bgcolor: "transparent",
            boxShadow: "none",
            "&:hover": { bgcolor: "lightgrey" },
          },
        }}

      >
        <SpeedDialAction
          icon={<InsertLinkIcon />}
          tooltipTitle="Upload File"
          onClick={openFilePicker}
        />
        <SpeedDialAction
          icon={<ShareOutlinedIcon />}
          tooltipTitle="Share"
          onClick={handleShare}
        />
      </SpeedDial>

      <input
        type="file"
        ref={fileInputRef}
        value={fileInputRef.current?.value}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </>
  );
};
