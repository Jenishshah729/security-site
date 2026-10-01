import React from 'react';

const capsules = [
  {
    id: 1,
    className: "w-[120px] h-[42px] sm:w-[150px] sm:h-[50px] md:w-[170px] md:h-[56px]",
    style: {
      top: '5%',
      left: 'max(2%, calc(50% - 460px))',
      '--rot': '-22deg',
      animation: 'floatCapsule1 18s ease-in-out infinite',
      opacity: 0.85
    }
  },
  {
    id: 2,
    className: "w-[200px] h-[65px] sm:w-[260px] sm:h-[80px] md:w-[320px] md:h-[95px]",
    style: {
      top: '18%',
      left: 'max(-60px, calc(50% - 640px))',
      '--rot': '20deg',
      animation: 'floatCapsule2 22s ease-in-out infinite',
      opacity: 0.75
    }
  },
  {
    id: 3,
    className: "w-[130px] h-[46px] sm:w-[170px] sm:h-[56px] md:w-[200px] md:h-[64px]",
    style: {
      top: '7%',
      right: 'max(2%, calc(50% - 470px))',
      '--rot': '24deg',
      animation: 'floatCapsule3 20s ease-in-out infinite',
      opacity: 0.85
    }
  },
  {
    id: 4,
    className: "w-[180px] h-[58px] sm:w-[230px] sm:h-[72px] md:w-[270px] md:h-[84px]",
    style: {
      bottom: '12%',
      left: 'max(-20px, calc(50% - 580px))',
      '--rot': '15deg',
      animation: 'floatCapsule1 25s ease-in-out infinite',
      opacity: 0.7
    }
  },
  {
    id: 5,
    className: "w-[220px] h-[70px] sm:w-[290px] sm:h-[90px] md:w-[360px] md:h-[105px]",
    style: {
      bottom: '6%',
      right: 'max(-60px, calc(50% - 620px))',
      '--rot': '18deg',
      animation: 'floatCapsule2 24s ease-in-out infinite',
      opacity: 0.75
    }
  },
  {
    id: 6,
    className: "w-[110px] h-[38px] sm:w-[140px] sm:h-[48px] md:w-[160px] md:h-[52px]",
    style: {
      top: '50%',
      right: 'max(1%, calc(50% - 500px))',
      '--rot': '-16deg',
      animation: 'floatCapsule3 21s ease-in-out infinite',
      opacity: 0.6
    }
  }
];

const BackgroundCapsules = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {capsules.map((item) => (
        <div
          key={item.id}
          className={`bg-capsule ${item.className}`}
          style={item.style}
        >
          {/* Inner 3D specular highlight glare */}
          <div className="bg-capsule-glare" />
        </div>
      ))}
    </div>
  );
};

export default BackgroundCapsules;
