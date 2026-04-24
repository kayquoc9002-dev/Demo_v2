import { useEffect } from "react";

export const useMetadata = (title: string, iconPath: string) => {
  useEffect(() => {
    // 1. Đổi tiêu đề
    document.title = title;

    // 2. Đổi Icon (Favicon)
    const link: HTMLLinkElement | null =
      document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = iconPath;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = iconPath;
      document.head.appendChild(newLink);
    }
  }, [title, iconPath]);
};
