import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [allPdfs, setAllPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllPdfs();
  }, []);

  const fetchAllPdfs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/all`);
      const data = await res.json();
      if (res.ok) {
        setAllPdfs(data.pdfs || []);
      }
    } catch (err) {
      console.error("Failed to fetch PDFs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
    setUploadResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Please select a PDF file first!");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pdf/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload PDF");
      }

      setUploadResult(data);
      setPdfFile(null);
      fetchAllPdfs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("লিংক কপি হয়েছে!");
  };

  const downloadQRCode = (qrCodeDataUrl, pdfId) => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `QR-Code-${pdfId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDeleteModal = (pdf) => {
    setPdfToDelete(pdf);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
    setPdfToDelete(null);
  };

  const handleDeletePDF = async () => {
    if (!pdfToDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pdf/${pdfToDelete.encodedId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete PDF");
      }

      alert("PDF সফলভাবে ডিলিট হয়েছে!");
      fetchAllPdfs();
      closeDeleteModal();
    } catch (err) {
      alert("PDF ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📄 PDF ম্যানেজমেন্ট ড্যাশবোর্ড
          </h1>
          <p className="text-gray-600">PDF আপলোড করুন এবং পরিচালনা করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                নতুন PDF আপলোড
              </h2>

              <div className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      ক্লিক করুন অথবা ফাইল drag করুন
                    </span>
                  </label>
                </div>

                {pdfFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>সিলেক্টেড ফাইল:</strong>
                      <br />
                      {pdfFile.name}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      আপলোড হচ্ছে...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      আপলোড করুন
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              {uploadResult && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    সফলভাবে আপলোড হয়েছে!
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex flex-col bg-white p-3 rounded gap-2">
                      <span className="text-xs text-gray-600 font-semibold">
                        Public Link:
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-700 font-mono break-all">
                          {uploadResult.displayLink || `dakhila.ldtax.gov.bd/dakhila-print/${uploadResult.encodedId}`}
                        </span>
                        <button
                          onClick={() => copyToClipboard(uploadResult.viewLink)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold whitespace-nowrap"
                        >
                          কপি করুন
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg shadow-md">
                      <div
                        onClick={() =>
                          downloadQRCode(
                            uploadResult.qrCode,
                            uploadResult.encodedId
                          )
                        }
                        className="cursor-pointer hover:opacity-80 transition relative group"
                      >
                        <img
                          src={uploadResult.qrCode}
                          alt="QR Code"
                          className="w-40 h-40"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded">
                          <svg
                            className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        QR Code ডাউনলোড করতে ক্লিক করুন
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  সকল PDF সমূহ
                </h2>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                  মোট: {allPdfs.length} টি
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : allPdfs.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500">এখনো কোনো PDF আপলোড হয়নি</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {allPdfs.map((pdf, index) => (
                    <div
                      key={pdf._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                              #{allPdfs.length - index}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(pdf.createdAt).toLocaleDateString(
                                "bn-BD"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-2">
                            <a
                              href={pdf.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              PDF দেখুন
                            </a>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  pdf.actualLink || `${import.meta.env.VITE_FRONTEND_URL}/dakhila-print/${pdf.encodedId}`
                                )
                              }
                              className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              লিংক কপি
                            </button>

                            <button
                              onClick={() => openDeleteModal(pdf)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              ডিলিট
                            </button>
                          </div>
                        </div>

                        {pdf.qrCode && (
                          <div
                            onClick={() =>
                              downloadQRCode(pdf.qrCode, pdf.encodedId)
                            }
                            className="ml-4 cursor-pointer hover:opacity-80 transition relative group"
                            title="ক্লিক করে ডাউনলোড করুন"
                          >
                            <img
                              src={pdf.qrCode}
                              alt="QR"
                              className="w-20 h-20 border border-gray-200 rounded p-1"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded">
                              <svg
                                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                PDF ডিলিট করবেন?
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              আপনি কি নিশ্চিত যে এই PDF টি ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে
              আনা যাবে না।
            </p>

            {pdfToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>তারিখ:</strong>{" "}
                  {new Date(pdfToDelete.createdAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition disabled:opacity-50"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleDeletePDF}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    ডিলিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    হ্যাঁ, ডিলিট করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;