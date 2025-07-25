import { FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; // X (Twitter)

const SocialIcons = () => {
  return (
    <div className="flex space-x-4 mt-6">
      <a
        href="https://github.com/aamitn"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition"
      >
        <FaGithub className="h-6 w-6" />
      </a>
      <a
        href="https://www.linkedin.com/company/furnxpertllc"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition"
      >
        <FaLinkedin className="h-6 w-6" />
      </a>
      <a
        href="https://www.facebook.com/furnxpertllc"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition"
      >
        <FaFacebook className="h-6 w-6" />
      </a>
      <a
        href="https://x.com/furnxpertllc"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition"
      >
        <FaXTwitter className="h-6 w-6" />
      </a>
    </div>
  );
};

export default SocialIcons;
