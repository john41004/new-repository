// src/pages/Home.jsx

const Home = () => {
  return (
    <div className="">
      <marquee
        style={{
          fontSize: "18px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
        }}
        direction="left"
        scrollAmount="3"
        onMouseOver={(e) => e.currentTarget.stop()}
        onMouseOut={(e) => e.currentTarget.start()}
      >
        নাগরিক www.ldtax.gov.bd এ ভিজিট করে অনলাইনে নিবন্ধন এবং ভূমি উন্নয়ন কর
        প্রদান করতে পারবেন।
      </marquee>

      <h5
        style={{
          padding: "5px",
          color: "#E74C3C",
          fontSize: "18px",
          textAlign: "center",
        }}
      >
        <strong>দাখিলা মডিউল</strong>
      </h5>

      <h5
        style={{
          padding: "5px",
          color: "#E74C3C",
          fontSize: "18px",
          textAlign: "center",
        }}
      >
        <strong>জরুরী প্রয়োজনে কল করুনঃ ১৬১২২</strong>
      </h5>
    </div>
  );
};

export default Home;
