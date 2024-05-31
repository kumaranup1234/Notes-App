import React from 'react';

const About = () => {
    return (
        <div className="min-h-[75px] h-fit w-full p-[10px] flex flex-wrap justify-start bg-[url('https://workik-widget-assets.s3.amazonaws.com/widget-assets/images/bb29.png')] bg-cover bg-no-repeat md:px-[30px]">
            <div className="max-w-[800px] flex flex-col items-center p-[20px] my-[150px] mx-auto bg-white rounded-lg">
                <p className="text-[36px] leading-[45px] font-extrabold my-0 mb-[30px] md:text-[32px] md:leading-[40px] md:mb-[20px] sm:text-[26px] sm:leading-[30px] sm:mb-[20px]">
                    About Us
                </p>
                <p className="text-center text-[18px] leading-[26px] my-0 mb-[60px] md:text-[18px] md:leading-[24px] md:mb-[60px] sm:text-[16px] sm:leading-[23px] sm:mb-[30px]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                </p>
                <div className="flex flex-row items-start sm:flex-wrap sm:justify-center sm:items-center">
                    <a className="mx-[50px] sm:mx-[20px]">
                        <img className="w-[33px] h-[33px] sm:w-[20px] sm:h-[20px]" src="https://workik-widget-assets.s3.amazonaws.com/widget-assets/images/bb33.png" alt="Social icon 1" />
                    </a>
                    <a className="mx-[50px] sm:mx-[20px]">
                        <img className="w-[33px] h-[33px] sm:w-[20px] sm:h-[20px]" src="https://workik-widget-assets.s3.amazonaws.com/widget-assets/images/bb34.png" alt="Social icon 2" />
                    </a>
                    <a className="mx-[50px] sm:mx-[20px]">
                        <img className="w-[33px] h-[33px] sm:w-[20px] sm:h-[20px]" src="https://workik-widget-assets.s3.amazonaws.com/widget-assets/images/bb35.png" alt="Social icon 3" />
                    </a>
                    <a className="mx-[50px] sm:mx-[20px]">
                        <img className="w-[33px] h-[33px] sm:w-[20px] sm:h-[20px]" src="https://workik-widget-assets.s3.amazonaws.com/widget-assets/images/bb36.png" alt="Social icon 4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;