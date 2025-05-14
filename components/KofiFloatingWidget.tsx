"use client";

interface KofiFloatingWidgetProps {
  isVisible: boolean;
}

const KofiFloatingWidget: React.FC<KofiFloatingWidgetProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="kofiFloatingWidget right-[-50px] top-0 absolute animate-fadeIn w-full md:w-[285px] h-[570px] flex-shrink-0">
      <iframe
        id="kofiframe"
        src="https://ko-fi.com/izeta/?hidefeed=true&widget=true&embed=true&preview=true"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          padding: '4px',
          background: '#f9f9f9',
          borderRadius: '8px',
        }}
        title="izeta"
      ></iframe>
    </div>
  );
};

export default KofiFloatingWidget;