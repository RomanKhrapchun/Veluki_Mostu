import { Suspense, lazy } from "react";
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import PageError from "./pages/ErrorPage/PageError"
import Loader from "./components/Loader/Loader"
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'

const UserList = lazy(() => import('./pages/Users/UserList'));
const UserView = lazy(()=>import('./pages/Users/UserView'))
const UserForm = lazy(()=>import('./components/Forms/UserForm'))
const Group = lazy(() => import('./pages/AccessGroup/AccessGroup'));
const Access = lazy(()=>import('./pages/AccessGroup/Access'))
const GroupView = lazy(()=>import('./pages/AccessGroup/AccessGroupView'))
const AccessGroupForm = lazy(()=>import('./components/Forms/AccessGroupForm'))
const Log = lazy(() => import('./pages/LogDisplay/Log'));
const DetailedLog = lazy(()=>import('./pages/LogDisplay/DetailedLog.jsx'))
const Secure = lazy(()=>import('./pages/LogDisplay/Secure'))
const BlackList = lazy(()=>import('./pages/LogDisplay/BlackList'))
const LogView = lazy(()=>import('./pages/LogDisplay/LogView'))
const Profile = lazy(() => import('./pages/Profile/Profile'));
const ModuleList  = lazy(()=>import('./pages/Module/ModuleList'))
const ModuleListView = lazy(()=>import('./pages/Module/ModuleListView'))
const ModuleForm = lazy(()=>import('./components/Forms/ModuleForm'))
const RegistryList  = lazy(()=>import('./pages/Registry/RegistryList'))
const RegistryListView = lazy(()=>import('./pages/Registry/RegistryListView'))
const RegistryForm = lazy(()=>import('./components/Forms/RegistryForm'))
const DebtorList = lazy(() => import('./pages/DebtorList/DebtorList.jsx'));
const DebtorView = lazy(()=>import('./pages/DebtorList/DebtorView.jsx'))
const PrintView = lazy(()=>import('./components/Cards/PrintCard.jsx'))
const PrintUtilityView = lazy(()=>import('./components/Cards/PrintUtilityCard.jsx'))
const PrintCNAPView = lazy(()=>import('./components/Cards/PrintCNAPCard.jsx'))
const UtilityView = lazy(() => import('./pages/Utilities/UtilityView.jsx'));
const UtilityList = lazy(() => import('./pages/Utilities/UtilityList.jsx'));
const PaidServicesList = lazy(() => import('./pages/CNAP/PaidServicesList.jsx'));
const AccountsList = lazy(() => import('./pages/CNAP/AccountsList.jsx'));
const CNAPServiceView = lazy(() => import('./pages/CNAP/ServiceView.jsx'));
const CNAPServiceCreate = lazy(() => import('./pages/CNAP/ServiceCreate.jsx'));
const CNAPAccountView = lazy(() => import('./pages/CNAP/AccountView.jsx'));
const CNAPServiceEdit = lazy(() => import('./pages/CNAP/ServiceEdit.jsx'));
const CNAPAccountCreate = lazy(() => import('./pages/CNAP/AccountCreate.jsx'));
// Revenue module
const AccountPlanList = lazy(() => import('./pages/revenue/AccountPlanList.jsx'));
const AccountPlanView = lazy(() => import('./pages/revenue/AccountPlanView.jsx'));
const AccountPlanCreate = lazy(() => import('./pages/revenue/AccountPlanCreate.jsx'));
const SettlementsList = lazy(() => import('./pages/revenue/SettlementsList.jsx'));
const SettlementsView = lazy(() => import('./pages/revenue/SettlementsView.jsx'));
const SettlementsCreate = lazy(() => import('./pages/revenue/SettlementsCreate.jsx'));
const PayerTypesList = lazy(() => import('./pages/revenue/PayerTypesList.jsx'));
const PayerTypesView = lazy(() => import('./pages/revenue/PayerTypesView.jsx'));
const PayerTypesCreate = lazy(() => import('./pages/revenue/PayerTypesCreate.jsx'));
const PayerDatabaseList = lazy(() => import('./pages/revenue/PayerDatabaseList.jsx'));
const PayerDatabaseView = lazy(() => import('./pages/revenue/PayerDatabaseView.jsx'));
const PayerDatabaseCreate = lazy(() => import('./pages/revenue/PayerDatabaseCreate.jsx'));
const DataInvoicesList = lazy(() => import('./pages/revenue/DataInvoicesList.jsx'));
const DataInvoicesView = lazy(() => import('./pages/revenue/DataInvoicesView.jsx'));
const DataInvoicesCreate = lazy(() => import('./pages/revenue/DataInvoicesCreate.jsx'));
const InvoiceDetailsList = lazy(() => import('./pages/revenue/InvoiceDetailsList.jsx'));
const InvoiceDetailsView = lazy(() => import('./pages/revenue/InvoiceDetailsView.jsx'));
const DistrictList = lazy(() => import('./pages/Districts/DistrictList.jsx'));
// Kindergarten
const KindergartenDebtorsList = lazy(() => import('./pages/Kindergarten/KindergartenList.jsx'))
const PrintKindergartenCardView = lazy(() => import ('./components/Cards/PrintKindergartenCard.jsx'))
// Sports complex
const SportsRequisite = lazy(() => import('./pages/SportsСomplex/Requisite.jsx'));
const SportsBills = lazy(() => import('./pages/SportsСomplex/Bills.jsx'));
const SportsServices = lazy(() => import('./pages/SportsСomplex/Services.jsx'));
const SportsRequisiteView = lazy(() => import('./pages/SportsСomplex/RequisiteView'));
const SportsRequisiteEdit = lazy(() => import('./pages/SportsСomplex/RequisiteEdit'));
const SportsServiceView = lazy(() => import('./pages/SportsСomplex/ServiceView.jsx'));
const SportsServiceEdit = lazy(() => import('./pages/SportsСomplex/ServiceEdit.jsx'));
const SportsBillDetails = lazy(() => import('./pages/SportsСomplex/BillDetails.jsx'));
const PrintSportsBillCard = lazy(() => import('./components/Cards/PrintBillCard.jsx'));
// Open data
const OpenDataList = lazy(() => import('./pages/OpenData/OpenDataList.jsx'));
const OpenDataUniversal = lazy(() => import('./pages/OpenData/OpenDataUniversal'));
// Debt charges
const DebtChargesList = lazy(() => import('./pages/DebtCharges/DebtChargesList.jsx'));
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Home />}>
                    <Route index element={<Dashboard />} />
                    <Route exact path="user" element={<Suspense fallback={<Loader />}><UserList /></Suspense>} />
                    <Route path="user/:userId" element={<Suspense fallback={<Loader/>}><UserView /></Suspense>} />
                    <Route exact path="user/add" element={<Suspense fallback={<Loader/>}><UserForm /></Suspense>} />
                    <Route path="user/:userId/edit" element={<Suspense fallback={<Loader/>}><UserForm /></Suspense>} />
                    <Route exact path="group" element={<Suspense fallback={<Loader />}><Group /></Suspense>} />
                    <Route path="group/:roleId" element={<Suspense fallback={<Loader/>}><GroupView /></Suspense>} />
                    <Route exact path="group/add" element={<Suspense fallback={<Loader />}><AccessGroupForm /></Suspense>}/>
                    <Route exact path="group/:roleId/access" element={<Suspense fallback={<Loader />}><Access /></Suspense>}/>
                    <Route path="group/:roleId/edit" element={<Suspense fallback={<Loader />}><AccessGroupForm /></Suspense>}/>
                    <Route exact path="logs" element={<Suspense fallback={<Loader />}><Log /></Suspense>} />
                    <Route path="logs/:id" element={<Suspense fallback={<Loader />}><LogView /></Suspense>} />
                    <Route exact path="/reports" element={<Suspense fallback={<Loader />}><DetailedLog /></Suspense>} />
                    <Route exact path="/secure" element={<Suspense fallback={<Loader />}><Secure /></Suspense>} />
                    <Route exact path="/blacklist" element={<Suspense fallback={<Loader />}><BlackList /></Suspense>} />
                    <Route path="profile" element={<Suspense fallback={<Loader />}><Profile /></Suspense>} />
                    <Route exact path="modules" element={<Suspense fallback={<Loader />}><ModuleList /></Suspense>} />
                    <Route path="modules/:moduleId" element={<Suspense fallback={<Loader />}><ModuleListView /></Suspense>} />
                    <Route exact path="modules/add" element={<Suspense fallback={<Loader/>}><ModuleForm /></Suspense>} />
                    <Route path="modules/:moduleId/edit" element={<Suspense fallback={<Loader/>}><ModuleForm /></Suspense>} />
                    <Route exact path="registry" element={<Suspense fallback={<Loader />}><RegistryList /></Suspense>} />
                    <Route path="registry/:registryId" element={<Suspense fallback={<Loader />}><RegistryListView /></Suspense>} />
                    <Route exact path="registry/add" element={<Suspense fallback={<Loader/>}><RegistryForm /></Suspense>} />
                    <Route path="registry/:registryId/edit" element={<Suspense fallback={<Loader/>}><RegistryForm /></Suspense>} />
                    <Route exact path="debtor" element={<Suspense fallback={<Loader />}><DebtorList /></Suspense>} />
                    <Route path="debtor/:debtId" element={<Suspense fallback={<Loader/>}><DebtorView /></Suspense>} />
                    <Route path="debtor/:debtId/print" element={<Suspense fallback={<Loader/>}><PrintView /></Suspense>}/>
                    <Route exact path="utilities" element={<Suspense fallback={<Loader />}><UtilityList /></Suspense>} />
                    <Route path="utilities/:id/" element={<Suspense fallback={<Loader />}><UtilityView /></Suspense>} />
                    <Route path="utilities/:id/print" element={<Suspense fallback={<Loader />}><PrintUtilityView /></Suspense>} />
                    {/* CNAP Routes */}
                    <Route exact path="cnap/services" element={<Suspense fallback={<Loader />}><PaidServicesList /></Suspense>} />
                    <Route exact path="cnap/services/create" element={<Suspense fallback={<Loader />}><CNAPServiceCreate /></Suspense>} />
                    <Route path="cnap/services/:id" element={<Suspense fallback={<Loader />}><CNAPServiceView /></Suspense>} />
                    <Route path="cnap/services/:id/edit" element={<Suspense fallback={<Loader />}><CNAPServiceEdit /></Suspense>} />
                    <Route exact path="cnap/accounts" element={<Suspense fallback={<Loader />}><AccountsList /></Suspense>} />
                    <Route exact path="cnap/accounts/create" element={<Suspense fallback={<Loader />}><CNAPAccountCreate /></Suspense>} />
                    <Route path="cnap/accounts/:id" element={<Suspense fallback={<Loader />}><CNAPAccountView /></Suspense>} />
                    <Route path="cnap/accounts/:debtId/print" element={<Suspense fallback={<Loader/>}><PrintCNAPView /></Suspense>}/>
                    {/* Revenue Routes */}
                    <Route exact path="revenue/account-plan" element={<Suspense fallback={<Loader />}><AccountPlanList /></Suspense>} />
                    <Route path="revenue/account-plan/:id" element={<Suspense fallback={<Loader />}><AccountPlanView /></Suspense>} />
                    <Route exact path="revenue/account-plan/create" element={<Suspense fallback={<Loader />}><AccountPlanCreate /></Suspense>} />
                    <Route exact path="revenue/settlements" element={<Suspense fallback={<Loader />}><SettlementsList /></Suspense>} />
                    <Route path="revenue/settlements/:id" element={<Suspense fallback={<Loader />}><SettlementsView /></Suspense>} />
                    <Route exact path="revenue/settlements/create" element={<Suspense fallback={<Loader />}><SettlementsCreate /></Suspense>} />
                    <Route exact path="revenue/payer-types" element={<Suspense fallback={<Loader />}><PayerTypesList /></Suspense>} />
                    <Route path="revenue/payer-types/:id" element={<Suspense fallback={<Loader />}><PayerTypesView /></Suspense>} />
                    <Route exact path="revenue/payer-types/create" element={<Suspense fallback={<Loader />}><PayerTypesCreate /></Suspense>} />
                    <Route exact path="revenue/payer-database" element={<Suspense fallback={<Loader />}><PayerDatabaseList /></Suspense>} />
                    <Route path="revenue/payer-database/:id" element={<Suspense fallback={<Loader />}><PayerDatabaseView /></Suspense>} />
                    <Route exact path="revenue/payer-database/create" element={<Suspense fallback={<Loader />}><PayerDatabaseCreate /></Suspense>} />
                    <Route exact path="revenue/data-invoices" element={<Suspense fallback={<Loader />}><DataInvoicesList /></Suspense>} />
                    <Route path="revenue/data-invoices/:id" element={<Suspense fallback={<Loader />}><DataInvoicesView /></Suspense>} />
                    <Route exact path="revenue/data-invoices/create" element={<Suspense fallback={<Loader />}><DataInvoicesCreate /></Suspense>} />
                    <Route exact path="revenue/details" element={<Suspense fallback={<Loader />}><InvoiceDetailsList /></Suspense>} />
                    <Route path="revenue/details/:id" element={<Suspense fallback={<Loader />}><InvoiceDetailsView /></Suspense>} />
                    {/*  Kindergarten */}
                    <Route exact path="kindergarten" element={<Suspense fallback={<Loader/>}><KindergartenDebtorsList /></Suspense>} />
                    <Route exact path="kindergarten/:id/print" element={<Suspense fallback={<Loader/>}><PrintKindergartenCardView /></Suspense>} />
                    {/* Districts Routes */}
                    <Route exact path="districts/:districtId" element={<Suspense fallback={<Loader />}><DistrictList /></Suspense>} />
                    <Route path="districts/:districtId/:debtId" element={<Suspense fallback={<Loader/>}><DebtorView /></Suspense>} />
                    <Route path="districts/:districtId/:debtId/print" element={<Suspense fallback={<Loader/>}><PrintView /></Suspense>}/>
                    {/* Sports complex */}
                    <Route exact path="sportscomplex/details" element={<Suspense fallback={<Loader />}><SportsRequisite /></Suspense>} />
                    <Route exact path="sportscomplex/bills" element={<Suspense fallback={<Loader />}><SportsBills /></Suspense>} />
                    <Route exact path="sportscomplex/services" element={<Suspense fallback={<Loader />}><SportsServices /></Suspense>} />
                    <Route path="sportscomplex/requisite/:requisiteId" element={<Suspense fallback={<Loader/>}><SportsRequisiteView /></Suspense>} />
                    <Route path="sportscomplex/requisite/:requisiteId/edit" element={<Suspense fallback={<Loader/>}><SportsRequisiteEdit /></Suspense>} />
                    <Route path="sportscomplex/service/:serviceId" element={<Suspense fallback={<Loader/>}><SportsServiceView /></Suspense>} />
                    <Route path="sportscomplex/service/:serviceId/edit" element={<Suspense fallback={<Loader/>}><SportsServiceEdit /></Suspense>} />
                    <Route path="sportscomplex/bills/:id/requisites" element={<Suspense fallback={<Loader />}><SportsBillDetails /></Suspense>} />
                    <Route path="sportscomplex/bills/:id/print" element={<Suspense fallback={<Loader />}><PrintSportsBillCard /></Suspense>} />
                    {/* Open data */}
                    <Route exact path="opendata" element={<Suspense fallback={<Loader />}><OpenDataList /></Suspense>} />
                    <Route path="opendata/:tableId/:action/:id" element={<Suspense fallback={<Loader />}><OpenDataUniversal /></Suspense>} />
                    <Route path="opendata/:tableId/" element={<Suspense fallback={<Loader />}><OpenDataUniversal /></Suspense>} />
                    {/* Debt charges */}
                    <Route exact path="debtcharges" element={<Suspense fallback={<Loader />}><DebtChargesList /></Suspense>} />
                    
                    <Route path="*" element={<PageError title="Схоже, цієї сторінки не знайдено." statusError="404"/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
