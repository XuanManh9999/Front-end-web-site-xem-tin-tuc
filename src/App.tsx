import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ManageUser from "./components/manage_user";
import ManageCourse from "./components/manage_course";
import ManageRole from "./components/manage_role";
import ManageReport from "./components/manage_report";
import ManageCategoryArticle from "./components/manage_category_post";
import ManagePost from "./components/manage_post";
import ManagePayment from "./components/manage_payment";
import ManageCategoryTag from "./components/manage_category_tag";
export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            {user?.roles?.some((role: any ) => role?.name === "ROLE_ADMIN") && (
              <Route path="/manage-user" element={<ManageUser />} />
            )}
            <Route path="/manage-course" element={<ManageCourse />} />
            <Route path="/manage-role" element={<ManageRole />} />
            <Route path="/manage-report" element={<ManageReport />} />
            <Route path="/manage-article-tag" element={<ManageCategoryTag />} />
            <Route path="/manage-article-type" element={<ManageCategoryArticle />} />
            <Route path="/manage-article" element={<ManagePost />} />
            <Route path="/manage-payment-history" element={<ManagePayment />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
