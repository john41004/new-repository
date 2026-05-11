
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ViewPDF = () => {
  const { encodedId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(() => {
    return sessionStorage.getItem(`pdf_url_${encodedId}`) || "";
  });
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(() => {
    const saved = sessionStorage.getItem(`pdf_pages_${encodedId}`);
    return saved ? parseInt(saved) : null;
  });

  useEffect(() => {
    const fetchPDF = async () => {
      if (pdfUrl) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pdf/${encodedId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch PDF");
        }

        setPdfUrl(data.pdfUrl);
        sessionStorage.setItem(`pdf_url_${encodedId}`, data.pdfUrl);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPDF();
  }, [encodedId, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    sessionStorage.setItem(`pdf_pages_${encodedId}`, numPages.toString());
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) return null;

  return (
    <>
      <style>{`
        .react-pdf__Document {
          background: transparent !important;
        }

        .react-pdf__Page {
          background: transparent !important;
          opacity: 1 !important;
           padding: 20px !important;
        }

        .react-pdf__Page__canvas {
          background: transparent !important;
        }

        /* Desktop এর জন্য column view */
        @media (min-width: 768px) {
          .print-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding-left: 100px;
            padding-right: 100px;
          }

          .react-pdf__Document {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            width: 100%;
            max-width: 800px;
          }

          
        }

        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .react-pdf__Page {
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0 !important;
            padding: 20px !important;
            width: 100% !important;
            height: 100vh !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          .react-pdf__Page:last-child {
            page-break-after: auto;
          }
          
          .react-pdf__Page canvas {
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            object-fit: contain !important;
          }

          .react-pdf__Document {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            gap: 0 !important;
            background: white !important;
          }

          @page {
            margin: 20px;
            size: A4 portrait;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#F4FFE6] overflow-x-auto overflow-y-auto space-y-7 pt-2">
        {numPages && (
          <div className="flex justify-center sticky top-0 bg-[#F4FFE6] z-10 no-print ml-48 mb-12">
            <button
              onClick={handlePrint}
              style={{
                paddingTop: "0.25rem",
                paddingBottom: "0.25rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                borderRadius: "0.25rem",
                color: "#ffffff",
                backgroundColor: "#3B82F6",
                borderColor: "#3B82F6",
                borderWidth: "1px",
                display: "flex",
                alignItems: "center",
                fontSize: "10px",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <span>🖨️ প্রিন্ট</span>
            </button>
          </div>
        )}

        <div className="print-container">
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading=""
              error=""
              options={{
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                cMapPacked: true,
              }}
            >
              {numPages &&
                Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    scale={1.2}
                    loading=""
                    error=""
                  />
                ))}
            </Document>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewPDF;
