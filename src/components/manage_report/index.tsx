import React from "react";
import MonthlySalesChart from "../ecommerce/MonthlySalesChart";

const ManageReport: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
      <div className="col-span-12">
        <MonthlySalesChart />
      </div>
    </div>
  );
};

export default ManageReport;
