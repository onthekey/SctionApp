using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Web;
using System.IO;

using Newtonsoft.Json;

using MoblieRestService.datebase;
using MoblieRestService.entity;


namespace MoblieRestService
{
    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class DistributionService
    {

        /// <summary>
        /// 获取所有的数据
        /// </summary>
        /// <param name="userId">用户Id</param>
        /// <param name="centerGroup"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getDistributionCount?userId={userId}&centerGroup={centerGroup}", ResponseFormat = WebMessageFormat.Json)]
        public string getDistributionCount(string userId, string centerGroup)
        {
            Distribution distribution = new Distribution();
            string result = distribution.getCount(userId, centerGroup);

            return result;
        }

        /// <summary>
        /// 通过用户获取能够被使用的站点
        /// </summary>
        /// <param name="userId">用户</param>
        /// <returns>站点列表JSON</returns>
        [WebGet(UriTemplate = "getSiteList?userId={userId}", ResponseFormat = WebMessageFormat.Json)]
        public string getSiteList(string userId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getSiteList(userId);

            return result;
        }

        [WebGet(UriTemplate = "getDataByConsultId/{consultId}")]
        public string getDataByConsultId(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getDataByConsultId(consultId);

            return result;
        }

        /// <summary>
        /// 通过筛选条件返回分诊数据
        /// </summary>
        /// <returns>返回分诊列表</returns>
        [WebGet(UriTemplate = "getTriageList/{userId}?site={site}&status={status}&type={type}&details={details}&start={start}&end={end}&centerGroup={centerGroup}",
             ResponseFormat = WebMessageFormat.Json)]
        public string getTriageList(string userId, string site, string status, string type, string details, string start, string end, string centerGroup)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getTriageList(userId, site, status, type, details, start, end, centerGroup);

            return result;
        }

        /// <summary>
        /// 获取需要的详细分诊信息
        /// </summary>
        /// <param name="consultId">需要被获取的数据的id</param>
        /// <returns>JSON格式数据</returns>
        [WebGet(UriTemplate = "getDistributeDetails?consultId={consultId}", ResponseFormat = WebMessageFormat.Json)]
        public string getDistributeDetails(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getDistributeDetails(consultId);

            return result;
        }

        /// <summary>
        /// 获取切片列表
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getDistributeSlideList?consultId={consultId}", ResponseFormat = WebMessageFormat.Json)]
        public string getDistributeSlideList(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getDistributeSlideList(consultId);

            return result;
        }

        /// <summary>
        /// 获取附件列表
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getDistributeAnnexList?consultId={consultId}", ResponseFormat = WebMessageFormat.Json)]
        public string getDistributeAnnexList(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getDistributeAnnexList(consultId);

            return result;
        }

        /// <summary>
        /// 获取对应id的留言
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "GetMessage?consultId={consultId}", ResponseFormat = WebMessageFormat.Json)]
        public string GetMessage(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getMessage(consultId);

            return result;
        }

        /// <summary>
        /// 提交特定用户的留言
        /// </summary>
        /// <param name="consultId">需要与留言绑定的数据</param>
        /// <param name="userId">留言发起人</param>
        /// <param name="message">留言</param>
        /// <returns>完成应答</returns>
        [WebInvoke(Method = "POST", UriTemplate = "sendMessageFromDistribution",
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string sendMessageFromDistribution(Stream s)
        {
            StreamReader reader = new StreamReader(s);
            string requestRetrunReasonString = reader.ReadToEnd();
            SingleMessage request = JsonConvert.DeserializeObject<SingleMessage>(requestRetrunReasonString);

            Distribution distribution = new Distribution();

            string result = distribution.sendMessageFromDistribution(request);

            return result;
        }

        /// <summary>
        /// 获取预约详情
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getReservationDetails?consultId={consultId}", ResponseFormat = WebMessageFormat.Json)]
        public string getReservationDetails(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getReservationDetails(consultId);

            return result;
        }

        /// <summary>
        /// 获取中心专家列表
        /// </summary>
        /// <param name="centerId"></param>
        /// <param name="hospitalId"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getCenterExpertList?centerId={centerId}&hospitalId={hospitalId}&expertId={expertId}",
            ResponseFormat = WebMessageFormat.Json)]
        public string getCenterExpertList(string centerId, string hospitalId, string expertId)
        {

            Distribution distribution = new Distribution();
            string result = distribution.getCenterExpertList(centerId, hospitalId, expertId);

            return result;
        }

        /// <summary>
        ///  将专家绑定到数据, 完成分配操作
        /// </summary>
        /// <param name="consultId"></param>
        /// <param name="expertId"></param>
        /// <param name="HasExpID"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "distributionExpertForCase?consultId={consultId}&expertId={expertId}&HasExpID={HasExpID}")]
        public string distributionExpertForCase(string consultId, string expertId, string HasExpID)
        {

            Distribution distribution = new Distribution();

            string result = distribution.distributionExpertForCase(consultId, expertId, HasExpID);

            return result;

        }


        /// <summary>
        /// 将专家绑定到数据, 完成预约操作
        /// </summary>
        /// <param name="consultId"></param>
        /// <param name="expertId"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "reservationExpertForCase?consultId={consultId}&expertId={expertId}",
            ResponseFormat = WebMessageFormat.Xml)]
        public string reservationExpertForCase(string consultId, string expertId)
        {

            Distribution distribution = new Distribution();

            // string result = "0";
            string result = distribution.reservationExpertForCase(consultId, expertId);

            return result;

        }

        /// <summary>
        /// 撤回预约数据
        /// </summary>
        /// <returns></returns>
        [WebInvoke(Method = "POST", UriTemplate = "returnReservation",
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string returnReservation(Stream s)
        {

            // 解析流生成参数对象
            StreamReader reader = new StreamReader(s);
            string obj = reader.ReadToEnd();
            ReturnParam param = JsonConvert.DeserializeObject<ReturnParam>(obj);

            Distribution distribution = new Distribution();

            string result = distribution.returnReservation(param);

            return result;

        }

        /// <summary>
        /// 获取退回理由
        /// </summary>
        /// <returns></returns>
        [WebGet(UriTemplate = "getReturnReasonList", ResponseFormat = WebMessageFormat.Json)]
        public string getReturnReasonList()
        {
            Distribution distribution = new Distribution();

            string result = distribution.getReturnReasonList();

            return result;
        }

        [WebGet(UriTemplate = "getReturnHistory?consultId={consultId}", ResponseFormat = WebMessageFormat.Json)]
        public string getReturnHistory(string consultId)
        {
            Distribution distribution = new Distribution();

            string result = distribution.getReturnHistory(consultId);

            return result;
        }

        /// <summary>
        /// 退回请求
        /// </summary>
        /// <param name="s">退回请求时的参数</param>
        /// <returns></returns>
        [WebInvoke(Method = "POST", UriTemplate = "returnCase",
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string returnCase(Stream s)
        {
            StreamReader reader = new StreamReader(s);
            string requestRetrunReasonString = reader.ReadToEnd();
            ReturnReason request = JsonConvert.DeserializeObject<ReturnReason>(requestRetrunReasonString);

            Distribution distribution = new Distribution();

            string result = distribution.returnCase(request);

            return result;

        }

        /// <summary>
        /// 多专家请求
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        [WebInvoke(Method = "POST", UriTemplate = "multiExpert",
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string multiExpert(Stream s)
        {
            StreamReader reader = new StreamReader(s);
            string paramString = reader.ReadToEnd();
            // 只需要获取consultId, 与recycle无关
            RecycleParam param = JsonConvert.DeserializeObject<RecycleParam>(paramString);

            Distribution distribution = new Distribution();
            string result = distribution.multiExpert(param.ConsultId);

            return result;
        }

        /// <summary>
        /// 撤回多专家诊断
        /// </summary>
        /// <returns></returns>
        [WebInvoke(Method = "POST", UriTemplate = "withdrawMultiExpert",
           RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string withdrawMultiExpert(Stream s)
        {
            StreamReader reader = new StreamReader(s);
            string paramString = reader.ReadToEnd();
            // 只需要获取consultId, 与recycle无关
            RecycleParam param = JsonConvert.DeserializeObject<RecycleParam>(paramString);

            Distribution distribution = new Distribution();
            string result = distribution.withdrawMultiExpert(param.ConsultId);

            return result;
        }

        /// <summary>
        /// 回收数据
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        [WebInvoke(Method = "POST", UriTemplate = "recycle",
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string recycle(Stream s)
        {
            StreamReader reader = new StreamReader(s);
            string obj = reader.ReadToEnd();
            RecycleParam param = JsonConvert.DeserializeObject<RecycleParam>(obj);

            Distribution distribution = new Distribution();
            string result = distribution.recycle(param);

            return result;
        }

        /// <summary>
        /// 取回数据
        /// </summary>
        /// <returns></returns>
        [WebInvoke(Method = "POST", UriTemplate = "reply",
            RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string reply(Stream s)
        {
            StreamReader reader = new StreamReader(s);
            string paramString = reader.ReadToEnd();
            RecycleParam param = JsonConvert.DeserializeObject<RecycleParam>(paramString);

            Distribution distribution = new Distribution();
            string result = distribution.reply(param);

            return result;
        }


        /// <summary>
        /// 会诊统计
        /// </summary>
        /// <param name="expertName"></param>
        /// <param name="year"></param>
        /// <param name="userID"></param>
        /// <param name="centerGroup"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getConsultationStatisticsList?expertName={expertName}&year={year}&userId={userId}&centerGroup={centerGroup}",
            ResponseFormat = WebMessageFormat.Json)]
        public string getConsultationStatisticsList(string expertName, string year, string userId, string centerGroup)
        {

            Distribution distribution = new Distribution();

            string result = distribution.getConsultationStatisticsList(expertName, year, userId, centerGroup);

            return result;
        }

        /// <summary>
        /// 站点统计
        /// </summary>
        /// <param name="site"></param>
        /// <returns></returns>
        [WebGet(UriTemplate = "getStatisticsForSite?startDtae={startDtae}&endDate={endDate}&diagnosisStartDate={diagnosisStartDate}&diagnosisEndDate={diagnosisEndDate}&hospitalId={hospitalId}",
            ResponseFormat = WebMessageFormat.Json)]
        public string getStatisticsForSite(string startDtae, string endDate, string diagnosisStartDate, string diagnosisEndDate, string hospitalId)
        {
            SiteStatisticsParam param = new SiteStatisticsParam(startDtae, endDate, diagnosisStartDate, diagnosisEndDate, hospitalId);
            Distribution distribution = new Distribution();

            string result = distribution.getStatisticsForSite(param);

            return result;
        }

        [WebGet(UriTemplate = "getStatisticsSiteList", ResponseFormat = WebMessageFormat.Json)]
        public string getStatisticsSiteList()
        {
            Distribution distribution = new Distribution();
            string result = distribution.getStatisticsSiteList();

            return result;
        }

        [WebGet(UriTemplate = "getStatisticsReport?userId={userId}&consultIdStatusId={consultIdStatusId}&caseTypeId={caseTypeId}&search={search}&startDate={startDate}&endDate={endDate}&start={start}&end={end}",
            ResponseFormat = WebMessageFormat.Json)]
        string getStatisticsReport(string userId, string consultIdStatusId, string caseTypeId, string search, string startDate, string endDate, string start, string end)
        {
            int id = int.Parse(userId);
            int startIndex = int.Parse(start);
            int endIndex = int.Parse(end);

            StatisticsReportParam param = new StatisticsReportParam(id, consultIdStatusId, caseTypeId, search, startDate, endDate, startIndex, endIndex);
            Distribution distribution = new Distribution();

            string result = distribution.getStatisticsReport(param);

            return result;
        }
    }
}