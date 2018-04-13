using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Configuration;
using System.IO;

using Newtonsoft.Json;

using FluentData;

using MoblieRestService.entity;
using MoblieRestService.Vo;
using MoblieRestService.util;

namespace MoblieRestService.datebase
{
    public class Distribution
    {
        private IDbContext context;

        public Distribution()
        {

            context = DBContext.get().getIDbContext();
        }


        /// <summary>
        /// 查询所有数据总计和
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="centerGroup"></param>
        /// <returns></returns>
        public string getCount(string userId, string centerGroup)
        {
            //string UserID = System.Web.HttpContext.Current.Request.Cookies["UserID"].Value;
            //string CenterGroup = System.Web.HttpContext.Current.Request.Cookies["CenterGroup"].Value;

            string whereArgs = " and CHARINDEX(','+CONVERT(VARCHAR(255),a.CenterID)+'|'+CONVERT(VARCHAR(255),a.HisID)+',', (select ',' +SiteGroup from Users where UserID=" + userId + "))>0";
            // 兰卫
            // string whereArgs = " AND CHARINDEX(','+CONVERT(VARCHAR(255), a.CenterID)+',', (select ',' + CenterGroup from Users where UserID= " + userId +"))>0";

            string sql = "select ( Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
                + " on b.ConsultID=c.ConsultID where ConsultStatusID=1 and ExpId is  null "
                + "and IsChange is null and (IsManyExp!='1' or IsManyExp is NULL ) " + whereArgs + ") as  notTriageCount," // 待分诊

                // 已分诊
                + "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
                + "  on b.ConsultID=c.ConsultID where ExpId is not null  and IsChange is null and IsManyExp is null and ConsultStatusID!=-77 and "
                + "ConsultStatusID!=0 and ConsultStatusID!=99 and ConsultStatusID!=100 and ConsultStatusID!=101 and ConsultStatusID!=-1 "
                + " and ConsultStatusID!=-2 " + whereArgs + ") as triageCount,"

                // 退回分诊 Number111
                + " (Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c  "
                + "  on b.ConsultID=c.ConsultID where (ConsultStatusID=-2 or ConsultStatusID=-1)" + whereArgs + ") as backTriageCount,"

                // 讨论病例
                + " (Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
                + "  on b.ConsultID=c.ConsultID where  ConsultStatusID=-77  " + whereArgs + ") as recycleCount,"

                // 多专家
                + " (Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c  "
                + "  on b.ConsultID=c.ConsultID where  IsManyExp='1' and ConsultStatusID!=-77 and ConsultStatusID!=0 and ConsultStatusID!=99 "
                + " and ConsultStatusID!=100 and ConsultStatusID!=101 and ConsultStatusID!=-1 and ConsultStatusID!=-2 and IsChange is null " + whereArgs + ") as multiExpertCount,"




                // 转诊-待诊断
                + "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
                + " on b.ConsultID=c.ConsultID where ConsultStatusID=1 and IsChange =1 and ExpId is  null and ','+ CONVERT(VARCHAR(255),CenterID) +',' in (select ',' "
                + "  +CenterGroup from Users where UserID=" + userId + ")) as referralWaitingCount,"

                // 诊断-已退回
                + "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c  "
                + "  on b.ConsultID=c.ConsultID where ConsultStatusID=1 and IsChange =2" + whereArgs + ") as referralBackCount,"

                // 转诊-已转诊
                + "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c  "
                + "  on b.ConsultID=c.ConsultID where  ConsultStatusID>=1 and a.IsChange =1 and ','+ CONVERT(VARCHAR(255),OldCenterID) +',' "
                + "in (select ',' +CenterGroup from Users where UserID=" + userId + ")) as referralDoneCount,"

                // 转诊-分诊
                + "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c  "
                + "  on b.ConsultID=c.ConsultID where ConsultStatusID>=1 and IsChange =1 and ExpId is not null "
                + " and CHARINDEX(','+CONVERT(VARCHAR(255),a.CenterID)+',','," + centerGroup + "')>0) as referralDiagnosisCount,"


                + "(SELECT COUNT(*) FROM Consultation a LEFT JOIN Diagnosis b ON a.ConsultID = b.ConsultID LEFT JOIN Cases c"
                + " ON b.ConsultID = c.ConsultID WHERE ConsultStatusID = 99 AND ExpId IS NULL AND IsChange IS NULL ) AS reservationCount";


            // 预约综合
            //+ "(SELECT COUNT(*) FROM Consultation a LEFT JOIN Diagnosis b ON a.ConsultID = b.ConsultID LEFT JOIN Cases c"
            //+ " ON b.ConsultID = c.ConsultID WHERE ((ConsultStatusID = 99 AND ExpId IS NULL) OR  ConsultStatusID = 100 OR  ConsultStatusID = 101)"
            //+ " AND IsChange IS NULL " + whereArgs + ") AS reservationCount";





            //// 预约-待分诊
            //+ "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
            //+ "  on b.ConsultID=c.ConsultID where ConsultStatusID=99  and IsChange is null and ExpId is  null " + whereArgs + ") as Number3,"

            //// 预约-已诊断
            //+ "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
            //+ "  on b.ConsultID=c.ConsultID where ConsultStatusID=100  and IsChange is null " + whereArgs + ") as Number4,"

            //// 预约-已退回
            //+ "(Select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c "
            //+ "  on b.ConsultID=c.ConsultID where ConsultStatusID=101  and IsChange is null " + whereArgs + ") as Number5";


            SqlOperator so = new SqlOperator();

            DataTable dt = so.ExecuteDataTable(sql, CommandType.Text, null);

            return JsonConvert.SerializeObject(dt);
        }

        /// <summary>
        /// 通过用户获取能够被使用的站点
        /// </summary>
        /// <param name="userId">用户</param>
        /// <returns>站点列表JSON</returns>
        public string getSiteList(string userId)
        {
            string selectSiteId = "SELECT SiteGroup FROM Users WHERE UserID = @0";

            DataTable temp = context.Sql(selectSiteId).Parameters(userId).QuerySingle<DataTable>();
            string siteGroupString = temp.Rows[0]["SiteGroup"].ToString();
            //string[] SiteArray = siteGroupString.Split(',');

            List<string> list = new List<string>(siteGroupString.Split(new string[] { ",", "|" },
                StringSplitOptions.RemoveEmptyEntries));

            string sitesString = SqlHelper.listToString(list);

            string selectSite = "select * from Hospital where HisID in(" + sitesString + ")";
            DataTable data = context.Sql(selectSite).QuerySingle<DataTable>();

            // 返回序列化的数据
            return JsonConvert.SerializeObject(data);
        }

        public string getDataByConsultId(string consultId)
        {
            string selectSql = "select ConsultStatusID as Status,Case_No as CaseNo,a.ConsultID as YConsultID,IsLock,IsPublisher,a.CenterID,a.OldCenterID,a.IsChange,c.ExpID,c.RecheckUser,TrashType,"
                   + " (select CenterName from Center where CenterID=a.CenterID) as CenterName, "
                   + " (select CenterName from Center where CenterID=a.OldCenterID) as OldCenterName, "
                   + " (select DisplayName from users where userid=c.expid)as DisplayName, "
                   + " (select DisplayName from users where userid=c.IntentionExp)as IntentionExpName, "
                   + " (select DisplayName from users where userid=c.RecheckUser)as RecheckUserDisplayName, "
                   + " YuName,YuPhone,YuDoctor,YuSex,YuAge,ConsultNo,OperationPart,ConsultTime,DistributTime,EBookTime,SBookTime as BookTime,SendHos as Hospital,BookContent,b.*,d.*"
                   + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                   + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                   + " left join Hospital d on a.HisID=d.HisID"
                   + " left join Users e on e.UserID=d.UserID"
                   + " where a.ConsultID = @consultId";

            DataTable data = context.Sql(selectSql).Parameter("consultId", consultId).QuerySingle<DataTable>();

            return JsonConvert.SerializeObject(data);
        }

        /// <summary>
        /// 获取标记状态的数据
        /// </summary>
        /// <param name="userId">用户</param>
        /// <param name="site">站点</param>
        /// <param name="status">状态</param>
        /// <param name="type">类型</param>
        /// <param name="details">详情</param>
        /// <param name="start">开始位置</param>
        /// <param name="end">结束位置</param>
        /// <returns></returns>
        public string getTriageList(string userId, string site, string status, string type, string details, string start, string end, string centerGroup)
        {

            string whereArgs = "";
            string noreservationAgrs = "";

            // 查询状态判定, 创建Where条件
            // 分诊片段
            if (status == "-2") // 退回病例
            {
                whereArgs = " and (ConsultStatusID=-2 or ConsultStatusID=-1) ";
            }
            else if (status == "1") // 未分诊
            {
                whereArgs = " and ConsultStatusID=1 and ExpId is  null and a.IsChange is null and (IsManyExp!='1' or IsManyExp is NULL ) ";
            }
            else if (status == "4") // 已分诊
            {
                whereArgs = " and (ExpId is not null) and ConsultStatusID!=-77 and ConsultStatusID!=0 and ConsultStatusID!=99 and ConsultStatusID!=100 and ConsultStatusID!=101 and ConsultStatusID!=-1 and ConsultStatusID!=-2 and IsChange is null and IsManyExp is null ";
            }
            else if (status == "22") // 多专家
            {
                whereArgs = " and IsManyExp='1' and ConsultStatusID!=-77 and ConsultStatusID!=0 and ConsultStatusID!=99 and ConsultStatusID!=100 and ConsultStatusID!=101 and ConsultStatusID!=-1 and ConsultStatusID!=-2 and IsChange is null ";
            }
            else if (status == "-77") // 讨论
            {
                whereArgs += " and ConsultStatusID = -77 ";
            }
            else if (status == "-21422-77")
            {
                whereArgs = " and ((ConsultStatusID=-2 or ConsultStatusID=-1) "
                    + " OR ConsultStatusID=1 and ExpId is  null and a.IsChange is null and (IsManyExp!='1' or IsManyExp is NULL ) "
                    + " OR (ExpId is not null) and ConsultStatusID!=-77 and ConsultStatusID!=0 and ConsultStatusID!=99 "
                    + "and ConsultStatusID!=100 and ConsultStatusID!=101 and ConsultStatusID!=-1 and ConsultStatusID!=-2 and IsChange is null and IsManyExp is null "
                    + " OR IsManyExp='1' and ConsultStatusID!=-77 and ConsultStatusID!=0 and ConsultStatusID!=99 "
                    + " and ConsultStatusID!=100 and ConsultStatusID!=101 and ConsultStatusID!=-1 and ConsultStatusID!=-2 and IsChange is null )";
                    //+ " OR ConsultStatusID = -77) ";
            }
            // 未知
            else if (status == "3")
            {
                whereArgs = " and ConsultStatusID=9 and IsChange is null ";
            }
            // 转诊片段
            else if (status == "7") // 待转诊
            {
                whereArgs = " and (ConsultStatusID=1 and a.IsChange =1 and ExpId is  null and ','+ CONVERT(VARCHAR(255),CenterID) +',' in (select ',' +CenterGroup from Users where UserID=" + userId + ")) ";
            }
            else if (status == "8") // 转诊退回
            {
                whereArgs = " and (ConsultStatusID=1 and a.IsChange =2) ";
            }
            else if (status == "9") // 已转诊
            {
                whereArgs = " and (ConsultStatusID>=1 and a.IsChange =1 and ','+ CONVERT(VARCHAR(255),OldCenterID) +',' in (select ',' +CenterGroup from Users where UserID=" + userId + ")) ";
            }
            else if (status == "10") // 已分诊转诊
            {
                whereArgs = " and (ConsultStatusID>=1 and a.IsChange =1  and ExpId is not null and CHARINDEX(','+CONVERT(VARCHAR(255),a.CenterID)+',','," + centerGroup + "')>0) ";
            }
            // 预约片段
            else if (status == "2") // 未预约
            {
                noreservationAgrs = "(select DisplayName from Users where UserID=a.ReturnUser) as ReturnUser ,";
                whereArgs = " and ConsultStatusID=99 and IsChange is null and ExpId is  null";
            }
            else if (status == "5") // 已预约
            {
                whereArgs = " and ConsultStatusID=100 and IsChange is null ";
            }
            else if (status == "101") // 退回预约
            {
                whereArgs = " and ConsultStatusID=101 and IsChange is null ";
            }
            else if (status == "25101") // 所有状态的预约
            {
                whereArgs = "AND IsChange IS NULL " + " AND ( ConsultStatusID = 100 OR ConsultStatusID = 100 OR ConsultStatusID = 101 ) ";
            }

            // 查询条件赋值, 当获取的条件不为空或空字符串时创建Where条件
            // 数据类型条件: 常规, 细胞, 冰冻
            if (type != "" && type != null)
                whereArgs += " and CaseTypeID ='" + type + "'";

            // 数据详情条件, 模糊查询
            if (details != "" && details != null)
                whereArgs += " AND ( Case_No LIKE '%" + details + "%' OR Name LIKE '%" + details + "%' ) ";

            // 数据站点条件
            if (site != "" && site != null)
                whereArgs += " and a.HisID = '" + site + "'";

            if (status != "9" && status != "7" && status != "10")
            {
                whereArgs += " and CHARINDEX(','+CONVERT(VARCHAR(255),a.CenterID)+'|'+CONVERT(VARCHAR(255),a.HisID)+',', (select ',' +SiteGroup from Users where UserID=" + userId + "))>0 ";
                // 兰卫
                //whereArgs += " AND CHARINDEX(','+CONVERT(VARCHAR(255), a.CenterID)+',', (select ',' + CenterGroup from Users where UserID= " + userId + "))>0";
            }

            string sql = "";

            sql = string.Format("select * from("
                    + "select ROW_NUMBER() OVER (order by a.ConsultID desc) as RowNumber,ConsultStatusID as Status,Case_No as CaseNo,a.ConsultID as YConsultID,IsLock,IsPublisher,a.CenterID,a.OldCenterID,a.IsChange,c.ExpID,c.RecheckUser,TrashType, IsManyExp, "
                    + " (select CenterName from Center where CenterID=a.CenterID) as CenterName, "
                    + " (select CenterName from Center where CenterID=a.OldCenterID) as OldCenterName, "
                    + " (select DisplayName from users where userid=c.expid)as DisplayName, "
                    + " (select DisplayName from users where userid=c.IntentionExp)as IntentionExpName, "
                    + " (select DisplayName from users where userid=c.RecheckUser)as RecheckUserDisplayName, "
                    + noreservationAgrs
                    + " YuName,YuPhone,YuDoctor,YuSex,YuAge,ConsultNo,OperationPart,ConsultTime,DistributTime,EBookTime,SBookTime as BookTime,SendHos as Hospital,BookContent,b.*,d.*"
                    + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                    + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                    + " left join Hospital d on a.HisID=d.HisID"
                    + " left join Users e on e.UserID=d.UserID"
                    + " where 1=1  {2}) T  where RowNumber between {0} and {1}", start, end, whereArgs);

            // 数据库查询操作, 查询列表
            DataTable data = context.Sql(sql).QuerySingle<DataTable>();

            // 获取当前获取的数据总量
            int currentCount = data.Rows.Count + int.Parse(start) - 1;

            // 筛选条件下数据总量
            int dataCount = context.Sql("select count(*) from Consultation a left join cases b on a.ConsultID=b.ConsultID left join  Diagnosis c on c.ConsultID=a.ConsultID left join Hospital d on a.HisID=d.HisID left join Users e on e.UserID=d.UserID where 1=1 " + whereArgs + "").QuerySingle<int>();

            return "{\"currentCount\":\"" + currentCount + "\",\"dataCount\":\"" + dataCount + "\",\"Rows\":" + JsonConvert.SerializeObject(data) + "}";
        }

        // 获取对应id响应的数据
        public string getDistributeDetails(string consultId)
        {
            string unit = ConfigurationManager.AppSettings["offsetUnit"];
            //string offset = ConfigurationManager.AppSettings["offset"];
            string offset = "0";

            string selectSql = "select c.HisID, c.CenterID, c.ConsultID, ConsultNo, c.ConsultStatusID AS status, c.IsPublisher, c.IsManyExp, Remark ,Menstruation, Telephone, Case_No as CaseNo,Name,Age,Sex,SendHos as Hospital,z_Marriage,z_Profession, "
                + " MaterialParts,NativePlace,PatientPhone,Specimen,SpecimenName,SpecimenNum,Summary,Blip,IsMicroscope,c.ConsultTime, "
                + " Clinical_Data,Early_Digagnosis,Gennerally_See,Immune_Group,z_History,z_Personal,z_Present,z_Operation,z_Image,z_examine,z_Digagnosis,z_Mirror,a.CaseType, b.CaseTypeName "
                + " , DATEDIFF(SS, GETDATE(), DATEADD(" + unit + ", " + offset + " , c.DistributTime)) as comparedDate1, " // 时间差查询
                + " DATEDIFF(SS, GETDATE(), DATEADD(" + unit + ", " + offset + " , c.ConsultTime)) as comparedDate2, " // 时间差查询
                + " (select count(1) from Slide where ConsultID=" + consultId + " ) as slidecount, "
                + " (select count(1) from Annex where ConsultID=" + consultId + " ) as annexcount, "
                + " d.ExpID "
                + " from Cases a, CaseType b ,Consultation c LEFT JOIN Diagnosis d ON c.ConsultID = d.ConsultID where a.ConsultID=c.ConsultID  and a.CaseTypeName=b.CaseTypeID and a.ConsultID = @consultId";
            // + " from Cases a, CaseType b ,Consultation c, Diagnosis d where a.ConsultID=c.ConsultID and a.ConsultID = d.ConsultID and a.CaseTypeName=b.CaseTypeID and a.ConsultID = @consultId";

            DataTable data = context.Sql(selectSql)
                .Parameter("consultId", consultId)
                .QuerySingle<DataTable>();

            return JsonConvert.SerializeObject(data);
        }

        //获取切片列表
        public string getDistributeSlideList(string consultId)
        {

            List<SlidePathVo> _list = new List<SlidePathVo>();
            string sql = "select * from Slide where ConsultID='" + consultId + "' order by UpTime,RanSe desc";
            //DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            DataTable dt = context.Sql(sql).QuerySingle<DataTable>();

            for (int i = 0; i < dt.Rows.Count; i++)
            {
                FileInfo fileInfo = new FileInfo(dt.Rows[i]["Client_Slide_Path"].ToString());
                SlidePathVo _SlidePathVo = new SlidePathVo();
                _SlidePathVo.Path = dt.Rows[i]["SerPath"].ToString() + dt.Rows[i]["FilePath"].ToString();
                _SlidePathVo.SlideName = dt.Rows[i]["SlideName"].ToString();
                string ReName = dt.Rows[i]["ReName"].ToString();
                if (ReName.Trim() == "")
                {
                    ReName = dt.Rows[i]["SlideName"].ToString();
                }
                if (!System.IO.File.Exists(_SlidePathVo.Path))
                {
                    if (fileInfo.Extension != ".kfb")
                        _SlidePathVo.Path = dt.Rows[i]["SerPath"].ToString() + "\\" + consultId + "\\Annex\\" + dt.Rows[i]["SlideName"].ToString() + "\\1.mds";
                }
                _SlidePathVo.ReName = ReName;
                _SlidePathVo.RanSe = dt.Rows[i]["RanSe"].ToString();
                _SlidePathVo.CaseNo = dt.Rows[i]["CaseNo"].ToString();
                _SlidePathVo.ClientPath = dt.Rows[i]["Client_Slide_Path"].ToString();
                string UncIp = dt.Rows[i]["UncIp"].ToString();
                string UncUserName = dt.Rows[i]["UncUserName"].ToString();
                string UncPassWord = dt.Rows[i]["UncPassWord"].ToString();
                string UncToken = "";
                if (UncIp != "" && UncUserName != "" && UncPassWord != "")
                {
                    string Token = "{\"ip\":\"" + UncIp + "\",\"username\":\"" + UncUserName + "\",\"password\":\"" + UncPassWord + "\"}";
                    string val = ConfigurationManager.AppSettings["UncTokenKey"].ToString();
                    UncToken = Convert.ToBase64String(Des3.Des3EncodeECB(val, Token));

                }

                _SlidePathVo.UncToken = UncToken;
                string status = "0";
                if (_SlidePathVo.Path.IndexOf("\\") == 0)
                {

                    IdentityScope iss = new IdentityScope(UncUserName, UncPassWord, UncIp);
                }
                if (_SlidePathVo.Path.StartsWith("http://"))
                {
                    _SlidePathVo.Path = _SlidePathVo.Path.Replace("\\", "/");
                    bool f = FileUnit.IsExist(_SlidePathVo.Path);
                    if (f == true)
                    {
                        status = "1";
                    }
                }
                else
                {
                    if (File.Exists(_SlidePathVo.Path))
                    {
                        status = "1";
                    }
                }
                _SlidePathVo.Status = status;
                _list.Add(_SlidePathVo);

            }
            return JsonConvert.SerializeObject(_list);
        }

        //获取附件列表
        public string getDistributeAnnexList(string consultId)
        {

            List<AnnexOneVo> _list = new List<AnnexOneVo>();
            string sql = "select * from Annex where ConsultID='" + consultId + "'";
            //DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            DataTable dt = context.Sql(sql).QuerySingle<DataTable>();

            for (int i = 0; i < dt.Rows.Count; i++)
            {
                AnnexOneVo _AnnexOneVo = new AnnexOneVo();
                _AnnexOneVo.Path = dt.Rows[i]["SerPath"].ToString() + dt.Rows[i]["FilePath"].ToString();
                // _AnnexOneVo.Path = AnnexPath + "\\" + ConsultID + "\\Annex\\" + dt.Rows[i]["AnnexName"].ToString();
                _AnnexOneVo.AnnexName = dt.Rows[i]["AnnexName"].ToString();
                _AnnexOneVo.ClientPath = dt.Rows[i]["Client_Annex_Path"].ToString();
                _AnnexOneVo.AnnexType = dt.Rows[i]["AnnexType"].ToString();

                string UncIp = dt.Rows[i]["UncIp"].ToString();
                string UncUserName = dt.Rows[i]["UncUserName"].ToString();
                string UncPassWord = dt.Rows[i]["UncPassWord"].ToString();
                string UncToken = "";
                if (UncIp != "" && UncUserName != "" && UncPassWord != "")
                {
                    string Token = "{\"ip\":\"" + UncIp + "\",\"username\":\"" + UncUserName + "\",\"password\":\"" + UncPassWord + "\"}";
                    string val = ConfigurationManager.AppSettings["UncTokenKey"].ToString();
                    UncToken = Convert.ToBase64String(Des3.Des3EncodeECB(val, Token));

                }

                _AnnexOneVo.UncToken = UncToken;

                string status = "0";
                if (_AnnexOneVo.Path.IndexOf("\\") == 0)
                {

                    IdentityScope iss = new IdentityScope(UncUserName, UncPassWord, UncIp);
                }

                if (_AnnexOneVo.Path.StartsWith("http://"))
                {
                    _AnnexOneVo.Path = _AnnexOneVo.Path.Replace("\\", "/");
                    bool f = FileUnit.IsExist(_AnnexOneVo.Path);
                    if (f == true)
                    {
                        status = "1";
                    }
                }
                else
                {
                    if (File.Exists(_AnnexOneVo.Path))
                    {
                        status = "1";
                    }
                }
                _AnnexOneVo.Status = status;
                _list.Add(_AnnexOneVo);

            }
            return JsonConvert.SerializeObject(_list);
        }

        // 获取留言列表
        public string getMessage(string consultId)
        {
            string selectSql = "SELECT DISTINCT MessageID, c.Case_No, c.Name, Message, DisplayName, MessageTime, Photo, RoleID, a.UserID "
               + " FROM Message a,Consultation b , Cases c, Users d WHERE a.ConsultID = c.ConsultID AND d.UserID = a.UserID AND a.ConsultID = @consultId";

            DataTable data = context.Sql(selectSql).Parameter("consultId", consultId).QuerySingle<DataTable>();

            return JsonConvert.SerializeObject(data);
        }

        public string sendMessageFromDistribution(SingleMessage message)
        {
            string result = "0";
            if (message.Message != "")
            {
                string insertSql = "INSERT INTO Message(ConsultID, Message, MessageTime, UserID) "
                    + " VALUES(@consultId, @message, @time, @userId)";

                context.Sql(insertSql)
                    .Parameter("consultId", message.ConsultId)
                    .Parameter("message", message.Message)
                    .Parameter("time", DateTime.Now.ToString())
                    .Parameter("userId", message.UserId)
                    .Execute();
                result = "sending message is completed";
            }

            return result;
        }

        public string distributionExpertForCase(string consultId, string expertId, string HasExpID)
        {
            string result = "0";

            using (IDbContext transaction = context.UseTransaction(true))
            {
                string sql = string.Format("select ConsultStatusID from Consultation Where ConsultID={0}", consultId);
                string Status = transaction.Sql(sql).QuerySingle<string>();
                if (Status == "-2")
                {
                    sql = string.Format("update Consultation set ConsultStatusID=1 where ConsultID={0}", consultId);
                    transaction.Sql(sql).Execute();
                    sql = string.Format("update  Diagnosis set IsDiagnosis='0' ,ExpID='{0}' where ConsultID='{1}'", expertId, consultId);
                    transaction.Sql(sql).Execute();
                }

                if (HasExpID != "")
                {
                    sql = string.Format("update Consultation set DistributTime='{0}' where ConsultID={1}", DateTime.Now.ToString(), consultId);
                    transaction.Sql(sql).Execute();
                    sql = string.Format("update  Diagnosis set IsDiagnosis='0' ,ExpID='{0}' where ConsultID='{1}'", expertId, consultId);
                }
                else if (Status != "-2")
                {
                    sql = "select IntentionExp from Diagnosis where ConsultID=" + consultId;
                    string InExp = transaction.Sql(sql).QuerySingle<string>();
                    if (InExp != null && InExp != "")
                    {
                        sql = string.Format("update  Diagnosis set IsDiagnosis='0' ,ExpID='{0}' where ConsultID='{1}'", expertId, consultId);
                    }
                    else
                    {
                        sql = string.Format("insert into Diagnosis (ExpId,IsDiagnosis,ConsultID) values({0},0,{1})", expertId, consultId);
                    }

                }
                result = transaction.Sql(sql).Execute().ToString();

                if (ConfigurationManager.AppSettings["Sms"] == "1")
                {
                    DataTable user = new DataTable();
                    DataTable cases = new DataTable();
                    cases = transaction.Sql(string.Format("select Case_No as CaseNo,CaseType,SendHos,SBookTime from Cases a left join Consultation b on a.ConsultID=b.ConsultID where a.ConsultID={0}", consultId)).QuerySingle<DataTable>();
                    user = transaction.Sql(string.Format("select DisplayName,Phone from Users where UserID=(select ExpId from Diagnosis where ConsultID='{0}')", consultId)).QuerySingle<DataTable>();
                    if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                    {
                        Sms.Message1(user.Rows[0]["Phone"].ToString(), cases.Rows[0]["CaseNo"].ToString(), user.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["SendHos"].ToString());
                    }
                }

                transaction.Commit();
            }

            return result;
        }



        // 获取预约信息
        public string getReservationDetails(string consultId)
        {
            int id = int.Parse(consultId);

            string selectSql = "select b.HisID, b.CenterID, c.HisName,b.ConsultID,b.ConsultStatusID,ReturnReason,"
            + " ConsultTime,b.YuName,b.YuPhone,b.YuDoctor,b.YuSex,b.YuAge,"
            + " ConsultNo,BookContent,convert(varchar(255),SBookTime,120) as BookTime,OperationPart"
            + " from Consultation b,Hospital c where 1=1  and b.HisID=c.HisID  and b.ConsultID= @consultId";

            DataTable data = context.Sql(selectSql).Parameter("consultId", id).QuerySingle<DataTable>();

            return JsonConvert.SerializeObject(data);
        }

        // 获取专家列表
        public string getCenterExpertList(string centerId, string hospitalId, string expertId)
        {
            string whereArgs = " 1 = 1 AND RoleID = 2  ";
            string sql = "";

            if (expertId != "" && expertId != null)
                whereArgs += " AND UserID <> " + expertId + " ";

            whereArgs += " and charindex(CONVERT(varchar(100),'" + centerId + "|" + hospitalId + "'),SiteGroup)>0 ";
            //兰卫
            // whereArgs += " AND CHARINDEX(','+ CONVERT(VARCHAR(100),'" + centerId + "'+','), ','+ CenterGroup)>0 ";

            sql = "SELECT * FROM users WHERE " + whereArgs;

            DataTable users = context.Sql(sql).QuerySingle<DataTable>();

            users.Columns.Add(new DataColumn("expcenter"));
            for (int i = 0; i < users.Rows.Count; i++)
            {

                string expertCenter = users.Rows[i]["CenterGroup"].ToString();
                string[] expertCenterArray = expertCenter.Split(',');
                string expertCenterString = "";
                for (int j = 0; j < expertCenterArray.Length; j++)
                {
                    if (expertCenterArray[j] != "")
                    {
                        sql = "SELECT CenterName FROM Center WHERE CenterID =" + expertCenterArray[j];
                        DataTable centerName = context.Sql(sql).QuerySingle<DataTable>();
                        expertCenterString += centerName.Rows[0]["CenterName"].ToString() + ",";
                    }
                }
                users.Rows[i]["expcenter"] = expertCenterString;
            }

            for (int i = 0; i < users.Rows.Count; i++)
            {

            }

            return JsonConvert.SerializeObject(users);
        }

        /// <summary>
        /// 将专家绑定到数据, 完成预约操作
        /// </summary>
        /// <param name="consultId"></param>
        /// <param name="expertId"></param>
        /// <returns></returns>
        public string reservationExpertForCase(string consultId, string expertId)
        {
            string result = "0";

            using (IDbContext transaction = context.UseTransaction(true))
            {

                string updateConsulationSql = "UPDATE Consultation SET ConsultStatusID = 100 WHERE ConsultID = " + consultId;
                if (ConfigurationManager.AppSettings["HDRecheck"] == "1")
                {
                    updateConsulationSql = "UPDATE Consultation SET ConsultStatusID = 99 WHERE ConsultID = ";
                }
                transaction.Sql(updateConsulationSql).Execute();

                string selectSql = "SELECT IntentionExp FROM Diagnosis WHERE ConsultId = " + consultId;
                string inExp = transaction.Sql(selectSql).QuerySingle<string>();
                string sql = "";
                if (inExp != null && inExp != "")
                {
                    sql = "UPDATE Diagnosis SET IsDiagnosis = '0', ExpId = " + expertId + " WHERE ConsultID = " + consultId;
                }
                else
                {
                    sql = "INSERT INTO Diagnosis (ExpId, IsDiagnosis, ConsultID) VALUES (" + expertId + ", 0, " + consultId + ")";
                }
                transaction.Sql(sql).Execute();

                if (ConfigurationManager.AppSettings["SmsFrozen"] == "1")
                {

                }
                result = "reservationExpertForCase is completed";

                if (ConfigurationManager.AppSettings["SmsFrozen"] == "1")
                {
                    DataTable user = new DataTable();
                    DataTable cases = new DataTable();
                    cases = transaction.Sql(string.Format("select * from Consultation a left join Hospital b on a.HisID=b.HisID  where ConsultID={0}", consultId)).QuerySingle<DataTable>();
                    user = transaction.Sql(string.Format("select DisplayName,Phone from Users where UserID=(select ExpId from Diagnosis where ConsultID='{0}' )", consultId)).QuerySingle<DataTable>();
                    string CenterID = cases.Rows[0]["CenterID"].ToString();
                    string BookContent = cases.Rows[0]["BookContent"].ToString();
                    string SBookTime = cases.Rows[0]["SBookTime"].ToString();
                    string DisplayName = user.Rows[0]["DisplayName"].ToString();
                    string HisName = cases.Rows[0]["HisName"].ToString();
                    if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                    {
                        if (ConfigurationManager.AppSettings["HDRecheck"] != "1")
                        {
                            Sms.Message6(user.Rows[0]["Phone"].ToString(), cases.Rows[0]["OperationPart"].ToString(), cases.Rows[0]["YuPhone"].ToString(), user.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["HisName"].ToString(), cases.Rows[0]["SBookTime"].ToString());
                        }
                        else
                        {
                            Sms.Message16(user.Rows[0]["Phone"].ToString(), HisName, SBookTime, BookContent, DisplayName);
                            if (ConfigurationManager.AppSettings["SmsCenter"] == "1")
                            {
                                DataTable Center = transaction.Sql(string.Format("select * from Center where CenterID='{0}'", CenterID)).QuerySingle<DataTable>();
                                Sms.Message14(Center.Rows[0]["CenterHos"].ToString(), HisName, SBookTime, BookContent, DisplayName);
                            }
                        }
                    }
                }
                transaction.Commit();
            }

            return result;
        }

        /// <summary>
        /// 退回预约
        /// 通过传入的参数将数据退回
        /// </summary>
        /// <param name="param">包含退回信息的实体类</param>
        /// <returns>是否完成结果</returns>
        public string returnReservation(ReturnParam param)
        {

            string result = "";

            string HDRecheck = ConfigurationManager.AppSettings["HDRecheck"].ToString();

            // 建立事务, 保证数据完整性
            using (IDbContext trans = context.UseTransaction(true))
            {
                // 改变预约数据状态 修改语句
                string updateStatus = "UPDATE Consultation SET ConsultStatusID = 101 WHERE ConsultID = @consultId";
                // 添加退回理由 修改语句
                string updateReason = "UPDATE Consultation SET ReturnReason = @reason WHERE ConsultID = @consultId";
                // 获取专家id 查询语句
                string selectExpert = "SELECT ExpId FROM Diagnosis WHERE ConsultID = @consultId";
                // 条件查询
                string whereIsDis1 = "UPDATE  Consultation SET ConsultStatusID = 101 WHERE ConsultID = @consultId";
                string whereIsDis2 = "UPDATE  Consultation SET ConsultStatusID = 99, ReturnUser = @expertId WHERE ConsultID= @consultId";
                // 删除诊断 删除语句
                string deleteDiagnosis = "DELETE FROM Diagnosis WHERE ConsultID = @consultId";

                //// 查询Case 查询语句
                //string selectCase = "SELECT CenterID, Case_No AS CaseNo, OperationPart, CaseType, SendHos, SBookTime " +
                //    " FROM Cases a LEFT JOIN Consultation b ON a.ConsultID = b.ConsultID WHERE a.ConsultID = @consultId";
                //// 查询用户
                //string selectUser = "SELECT Phone,HisName FROM Consultation a LEFT JOIN Hospital b ON a.HisID = b.HisID "
                //    + " LEFT JOIN Users c ON b.UserID=c.UserID WHERE ConsultID= @consultId";

                // 修改预约状态
                trans.Sql(updateStatus).Parameter("consultId", param.ConsultId).Execute();

                // 如果存在条件修改数据表
                if (param.Reason != "")
                {

                    // 添加退回原因
                    trans.Sql(updateReason).Parameter("reason", param.Reason).Parameter("consultId", param.ConsultId).Execute();
                }

                if (HDRecheck == "1")
                {

                    int expertId = trans.Sql(selectExpert).Parameter("consultId", param.ConsultId).QuerySingle<int>();
                    string whereIsDis = "";
                    if (param.IsDis == 1)
                        whereIsDis = whereIsDis1;
                    else
                        whereIsDis = whereIsDis2;
                    trans.Sql(whereIsDis).Execute();
                    // 删除诊断
                    trans.Sql(deleteDiagnosis).Execute();
                }

                result = "returnReservation is completed";

                trans.Commit();

                IDbContext subContext = DBContext.get().getIDbContext();
                using (IDbContext subTrans = subContext.UseTransaction(true))
                {
                    if (param.IsDis == 1)
                    {
                        DataTable cases = subTrans.Sql(string.Format("select CenterID,Case_No as CaseNo,OperationPart,CaseType,SendHos,SBookTime from Cases a left join Consultation b on a.ConsultID=b.ConsultID where a.ConsultID={0}", param.ConsultId)).QuerySingle<DataTable>();
                        DataTable user = subTrans.Sql(string.Format("select Phone,HisName from Consultation a left join Hospital b on a.HisID=b.HisID left join Users c on b.UserID=c.UserID   where ConsultID='{0}'", param.ConsultId)).QuerySingle<DataTable>();
                        if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                        {
                            Sms.Message19(user.Rows[0]["Phone"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["OperationPart"].ToString(), cases.Rows[0]["SBookTime"].ToString());
                            //中心抄送短信
                            if (ConfigurationManager.AppSettings["SmsCenter"] == "1")
                            {
                                DataTable Center = subTrans.Sql(string.Format("select * from Center where CenterID='{0}'", cases.Rows[0]["CenterID"])).QuerySingle<DataTable>();
                                Sms.Message20(Center.Rows[0]["CenterHos"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["OperationPart"].ToString(), cases.Rows[0]["SBookTime"].ToString());
                            }

                        }

                    }
                    else
                    {
                        if (ConfigurationManager.AppSettings["SmsFrozen"] == "1")//发短信开关
                        {
                            DataTable cases = subTrans.Sql(string.Format("select * from Consultation a left join Hospital b on a.HisID=b.HisID  where ConsultID={0}", param.ConsultId)).QuerySingle<DataTable>();
                            string CenterID = cases.Rows[0]["CenterID"].ToString();
                            string BookContent = cases.Rows[0]["BookContent"].ToString();
                            string SBookTime = cases.Rows[0]["SBookTime"].ToString();
                            DataTable user = subTrans.Sql(string.Format("select TOP(1) DisplayName,Phone from Users where RoleID=1 and Enable=1 and charindex(CONVERT(varchar(100),'" + CenterID + "'+','),CenterGroup)>0 ")).QuerySingle<DataTable>();
                            //中心分配员
                            Sms.Message13(user.Rows[0]["Phone"].ToString(), cases.Rows[0]["HisName"].ToString(), user.Rows[0]["DisplayName"].ToString(), BookContent, SBookTime);
                            //中心抄送短信
                        }
                    }

                    subTrans.Commit();
                }
            }

            return result;
        }

        // 获取退回原因模板
        public string getReturnReasonList()
        {

            string selectSql = "SELECT * FROM ReturnReason WHERE Reason NOT LIKE '(中心)%'";

            DataTable data = context.Sql(selectSql).QuerySingle<DataTable>();

            return JsonConvert.SerializeObject(data);
        }

        // 获取历史退回原因
        public string getReturnHistory(string consultId)
        {
            string result = "[]";

            using (IDbContext trans = context.UseTransaction(true))
            {

                string selectFromCase = "SELECT ROW_NUMBER() OVER (ORDER BY id) AS RowNum ,Reason,Expain,ReturnTime, UserID "
                + " from ReturnCase WHERE ConsultID = @consultId";

                string selectFromReason = "SELECT * FROM ReturnReason WHERE ID = @id";
 
                List<ReturnReason> list = trans.Sql(selectFromCase).Parameter("consultId", consultId).QueryMany<ReturnReason>();

                //DataTable data = trans.Sql(selectFromCase).Parameter("consultId", consultId).QuerySingle<DataTable>();

                for (int i = 0; i < list.Count; i++)
                {
                    string[] reasonString = list[i].Reason.Split(',');
                    list[i].Reason = "";

                    for (int j = 0; j < reasonString.Length; j++)
                    {
                        DataTable data = trans.Sql(selectFromReason).Parameter("id", reasonString[j]).QuerySingle<DataTable>();

                        list[i].Reason += data.Rows[0]["Reason"].ToString();
                        if (j != reasonString.Length - 1)
                            list[i].Reason += "|";
                    }

                    result = JsonConvert.SerializeObject(list);
                }

                trans.Commit();
            }

            return result;
        }

        // 退回请求
        public string returnCase(ReturnReason request)
        {
            string result = "0";

            using (IDbContext trans = context.UseTransaction(true))
            {
                // 退回标识修改 修改语句
                string updateSql = "UPDATE Consultation SET ConsultStatusID = '-1' WHERE ConsultID= @consultId";
                // 添加退回信息 添加语句
                string insertSql = "insert into ReturnCase (ConsultID, Reason, Expain, UserID, ReturnTime) "
                    + " values( @consultID , @reason , @explanation , @userId , @date)";

                // 退回标识修改
                trans.Sql(updateSql).Parameter("consultId", request.ConsultId).Execute();
                // 添加退回信息
                trans.Sql(insertSql)
                    .Parameter("consultID", request.ConsultId)
                    .Parameter("reason", request.Reason)
                    .Parameter("explanation", request.Expain)
                    .Parameter("userId", request.UserId)
                    .Parameter("date", DateTime.Now.ToString())
                    .Execute();

                trans.Commit();

                result = "returnCase is completed";

            }

            return result;
        }

        /// <summary>
        /// 请求多专家
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        public string multiExpert(string consultId)
        {

            string result = "0";

            using (IDbContext transaction = context.UseTransaction(true))
            {

                string insertSql = "INSERT INTO Diagnosis ( ExpId, IsDiagnosis, ConsultID ) values( -1, 0, @consultId)";
                string updateSql = "UPDATE Consultation SET IsManyExp = '1' WHERE ConsultID = @consultId";

                transaction.Sql(insertSql)
                    .Parameter("consultId", consultId)
                    .Execute();

                int data = transaction.Sql(updateSql)
                    .Parameter("consultId", consultId)
                    .Execute();

                transaction.Commit();

                result = data.ToString();

            }

            return result;
        }

        /// <summary>
        /// 撤回多专家诊断
        /// </summary>
        /// <param name="consultId"></param>
        /// <returns></returns>
        public string withdrawMultiExpert(string consultId)
        {
            string result = "0";

            using (IDbContext transaction = context.UseTransaction(true))
            {
                string deleteSql = "DELETE FROM Diagnosis WHERE ConsultID = @consultId";
                string updateSql = "UPDATE Consultation SET IsManyExp = NULL , ManyExpID = NULL WHERE ConsultStatusID != 4  and ConsultID = @consultId";

                int delFlag = transaction.Sql(deleteSql)
                     .Parameter("consultId", consultId)
                     .Execute();


                int upFlag = transaction.Sql(updateSql)
                     .Parameter("consultId", consultId)
                     .Execute();

                transaction.Commit();
                
                result = 0 == delFlag * upFlag ? "0" : "withdraw MultiExpert is completed";
            }

            return result;
        }

        /// <summary>
        /// 回收数据
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        public string recycle(RecycleParam param)
        {
            string updateSql = "UPDATE Consultation SET ConsultStatusID = '-77', TrashType = @type WHERE ConsultID = @consultId";
            int result = context.Sql(updateSql)
                .Parameter("type", param.Type)
                .Parameter("consultId", param.ConsultId)
                .Execute();

            return param.ConsultId + "has been recycled, status:" + result;
        }

        /// <summary>
        /// 取回数据
        /// </summary>
        /// <returns></returns>
        public string reply(RecycleParam param)
        {
            string result = "-1";
            using (IDbContext transaction = context.UseTransaction(true))
            {

                string sql = "select * from Consultation  where ConsultNo =(select ConsultNo from Consultation where ConsultID=" + param.ConsultId + ")";
                DataTable dt1 = transaction.Sql(sql).QuerySingle<DataTable>();
                string sql2 = "select * from Diagnosis where ConsultID=" + param.ConsultId;
                DataTable dt2 = transaction.Sql(sql2).QuerySingle<DataTable>();
                if (dt1.Rows.Count > 0)
                {
                    result = dt1.Rows[0]["ConsultNo"].ToString();
                    if (dt2.Rows.Count > 0)
                    {
                        string IsDiagnosis = dt2.Rows[0]["IsDiagnosis"].ToString();
                        if (IsDiagnosis == "1")
                        {
                            transaction.Sql(string.Format("update Consultation set ConsultStatusID='4',TrashType=NULL where ConsultID={0}", param.ConsultId)).Execute();
                        }
                        else if (IsDiagnosis == "0")
                        {
                            transaction.Sql(string.Format("update Consultation set ConsultStatusID='1',TrashType=NULL where ConsultID={0}", param.ConsultId)).Execute();
                        }
                    }
                    else
                    {
                        transaction.Sql(string.Format("update Consultation set ConsultStatusID='1',TrashType=NULL where ConsultID={0}", param.ConsultId)).Execute();
                    }
                    //if (dt1.Rows.Count > 1)
                    //{
                    //    result = GetConsultLastID_zl();
                    //    transaction.Sql(string.Format("update Consultation set ConsultNo='{1}',TrashType=NULL where ConsultID={0}", param.ConsultId, result)).Execute();
                    //}
                }

                transaction.Commit();
            }
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
        public string getConsultationStatisticsList(string expertName, string year, string userId, string centerGroup)
        {
            string result = "0";

            using (IDbContext transaction = context.UseTransaction(true))
            {
                string whereArgs = "";
                if (year != "")
                    whereArgs += " and YEAR(d.DiagnosisTime)='" + year + "'";
                if (expertName != "")
                    whereArgs += " and (select DisplayName from Users u2 where d.ExpId=u2.UserID) LIKE '%" + expertName + "%'";

                string[] CenterIDs = centerGroup.Split(',');
                DataTable data = new DataTable();
                for (int i = 0; i < CenterIDs.Length; i++)
                {
                    string sql = @"select 
                            sum(case MONTH(DiagnosisTime) when '1' then 1 else 0 end) as January,
                            sum(case MONTH(DiagnosisTime) when '2'then 1 else 0 end) as February,
                            sum(case MONTH(DiagnosisTime) when '3' then 1 else 0 end) as March,
                            sum(case MONTH(DiagnosisTime) when '4' then 1 else 0 end) as April,
                            sum(case MONTH(DiagnosisTime) when '5' then 1 else 0 end) as May,
                            sum(case MONTH(DiagnosisTime) when '6' then 1 else 0 end) as June,
                            sum(case MONTH(DiagnosisTime) when '7' then 1 else 0 end) as July,
                            sum(case MONTH(DiagnosisTime) when '8' then 1 else 0 end) as  August,
                            sum(case MONTH(DiagnosisTime) when '9' then 1 else 0 end) as September,
                            sum(case MONTH(DiagnosisTime) when '10' then 1 else 0 end) as October,
                            sum(case MONTH(DiagnosisTime) when '11' then 1 else 0 end) as November,
                            sum(case MONTH(DiagnosisTime) when '12' then 1 else 0 end) as December,
                            (select DisplayName from Users u where d.ExpId=u.UserID) as ExpName
                            from Diagnosis d 
                            where ExpId in(select u1.UserID 
                            from Users u1 where RoleID=2 and CHARINDEX('" + CenterIDs[i] + ",',u1.CenterGroup)>0)" + whereArgs + " group by ExpId";
                    DataTable selectData = transaction.Sql(sql).QuerySingle<DataTable>();
                    data.Merge(selectData);

                }
                transaction.Commit();

                result = JsonConvert.SerializeObject(data);
            }

            return result;
        }

        /// <summary>
        /// 站点统计
        /// </summary>
        /// <returns></returns>
        public string getStatisticsForSite(SiteStatisticsParam param)
        {
            string selectSql = " SELECT distinct n.HisName AS hospital, "
                + " ( SELECT COUNT(*)  FROM Consultation a LEFT JOIN Diagnosis b ON a.ConsultID = b.ConsultID "
                + " WHERE ( ConsultStatusID = 1 OR ConsultStatusID = 2 ) AND HisID = m.HisID AND IsDiagnosis = 0 ) AS notDiagnosisCount, "
                + " ( SELECT COUNT(*) FROM Consultation a LEFT JOIN Diagnosis b ON a.ConsultID = b.ConsultID "
                + " WHERE ConsultStatusID = 4 AND IsDiagnosis = 1 AND HisID = m.HisID ) AS diagnosisCount, "
                + " (SELECT COUNT(*) FROM Consultation a LEFT JOIN Diagnosis b ON a.ConsultID = b.ConsultID "
                + " WHERE IsDiagnosis = 0 and ( a.ConsultStatusID = -1 OR a.ConsultStatusID = -2 ) AND HisID = m.HisID ) AS returnDiagnosisCount, "
                + " ( SELECT SUM(ChargeMoney) FROM Consultation a LEFT JOIN Diagnosis b ON a.ConsultID = b.ConsultID LEFT JOIN Charge c ON c.ID = a.MoneyID "
                + " WHERE HisID = m.HisID AND ConsultStatusID = 4 AND IsDiagnosis = 1 ) AS sumMoney "
                + " FROM Consultation m LEFT JOIN Hospital n ON m.HisID = n.HisID LEFT JOIN Diagnosis p ON p.ConsultID = m.ConsultID ";

            //FluentData.IDbCommand command = context.Sql(selectSql);

            string whereArgs = "WHERE 1 = 1 ";

            if (param.HospitalId != "" && param.HospitalId != "0")
            {
                whereArgs += " AND m.HisID= " + param.HospitalId;
            }

            if (param.StartDtae != "" && param.EndDate != "")
            {
                whereArgs += " AND ConsultTime BETWEEN '" + DateTime.Parse(param.StartDtae).ToString("yyyy-MM-dd 00:00:00") + "' AND '" + DateTime.Parse(param.EndDate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (param.StartDtae == "" && param.EndDate != "")
            {
                whereArgs += " AND ConsultTime BETWEEN '1970-01-01 23:59:59' AND '" + DateTime.Parse(param.EndDate).ToString("yyyy-MM-dd 23:59:59") + "'";

            }
            if (param.StartDtae != "" && param.EndDate == "")
            {
                whereArgs += " AND ConsultTime BETWEEN '" + DateTime.Parse(param.StartDtae).ToString("yyyy-MM-dd 00:00:00") + "' AND '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";

            }

            if (param.DiagnosisStartDate != "" && param.DiagnosisEndDate != "")
            {
                whereArgs += " AND DiagnosisTime BETWEEN '" + DateTime.Parse(param.DiagnosisStartDate).ToString("yyyy-MM-dd 00:00:00") + "' AND '" + DateTime.Parse(param.DiagnosisEndDate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (whereArgs == "" && param.DiagnosisEndDate != "")
            {
                whereArgs += " AND DiagnosisTime between '1970-01-01 23:59:59' AND '" + DateTime.Parse(param.DiagnosisEndDate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (param.DiagnosisStartDate != "" && param.DiagnosisEndDate == "")
            {
                whereArgs += " AND DiagnosisTime between '" + DateTime.Parse(param.DiagnosisStartDate).ToString("yyyy-MM-dd 00:00:00") + "' AND '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";
            }

            selectSql += whereArgs;

            DataTable result = context.Sql(selectSql).QuerySingle<DataTable>();
            //DataTable result = command.QuerySingle<DataTable>();
            return JsonConvert.SerializeObject(result);
        }

        public string getStatisticsSiteList()
        {
            string selectSql = "SELECT distinct n.HisName AS hospital, n.HisID AS hospitalId FROM Consultation m LEFT JOIN Hospital n ON m.HisID = n.HisID LEFT JOIN Diagnosis p ON p.ConsultID = m.ConsultID";

            DataTable data = context.Sql(selectSql).QuerySingle<DataTable>();

            return JsonConvert.SerializeObject(data);
        }

        /// <summary>
        /// 统计报表
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        public string getStatisticsReport(StatisticsReportParam param)
        {
            string whereArgs = "";

            //会诊状态
            if (param.ConsultIdStatusId == "0" || param.ConsultIdStatusId == "")
            {
                whereArgs += "";
            }
            else if (param.ConsultIdStatusId == "1")
            {
                whereArgs += "and  ConsultStatusID=1 and (select ExpId from Diagnosis d  where d.ConsultID=b.ConsultID ) IS NULL ";
            }
            else if (param.ConsultIdStatusId == "11")
            {
                whereArgs += "and  ConsultStatusID=1 and ((select ExpId from Diagnosis d  where d.ConsultID=b.ConsultID ) IS NOT NULL or (select ExpId from Diagnosis d  where d.ConsultID=b.ConsultID )=-1 ) and isnull(IsLock,'0')=0";
            }
            else if (param.ConsultIdStatusId == "111")
            {
                whereArgs += "and  ConsultStatusID=1 and (select ExpId from Diagnosis d  where d.ConsultID=b.ConsultID )IS NOT NULL and isnull(IsLock,'0')!=0";
            }
            else if (param.ConsultIdStatusId == "2")
            {
                whereArgs += "and  ConsultStatusID=2";
            }
            else if (param.ConsultIdStatusId == "4")
            {
                whereArgs += " and ConsultStatusID=4 and IsPublisher!=1";
            }
            else if (param.ConsultIdStatusId == "5")
            {
                whereArgs += " and ConsultStatusID=4 and IsPublisher=1";
            }
            else if (param.ConsultIdStatusId == "-1")
            {
                whereArgs += " and (ConsultStatusID=-1 or ConsultStatusID=-2)";
            }
            //病理类型
            if (param.CaseTypeId == "0" || param.CaseTypeId == "")
            {
                whereArgs += "";
            }
            else if (param.CaseTypeId == "1")
            {
                whereArgs += " and CaseTypeID=1 ";
            }
            else if (param.CaseTypeId == "2")
            {
                whereArgs += " and CaseTypeID=2 ";
            }
            else if (param.CaseTypeId == "3")
            {
                whereArgs += " and CaseTypeID=3 ";
            }
            //诊断时间
            if (param.StartDate != "")
            {
                whereArgs += "  and d.DiagnosisTime>='" + param.StartDate + " '";
            }
            if (param.EndDate != "")
            {
                whereArgs += "  and d.DiagnosisTime<='" + param.EndDate + "'";
            }
            //搜索病理号和姓名
            if (param.Search != "" && param.Search != "undefined")
            {
                whereArgs += "  and (Case_No Like '%" + param.Search + "%' or Name Like '%" + param.Search + "%' or DisplayName Like '%" + param.Search + "%') ";

            }
            string UserID = Convert.ToString(param.UserId);

            whereArgs += " AND CHARINDEX(','+ CONVERT(VARCHAR(255), b.CenterID) + '|'+ CONVERT(VARCHAR(255), b.HisID)+',', ( SELECT ',' +SiteGroup FROM Users WHERE UserID =" + UserID + "))>0";

            string sql = string.Empty;
            sql = "SELECT * FROM ("
                    + " SELECT ROW_NUMBER() OVER (order by a.ConsultID DESC) AS RowNumber, ManyExpID, b.CenterID, b.OldCenterID, ConsultStatusID, CaseTypeID, "
                    + " b.HisID, Case_No, Name, b.ConsultID, CaseID, Sex, Age, SendHos, b.ConsultNo, CaseType, Purpose, "
                    + " IsLock, IsPublisher, c.FtpName, c.FtpCatalog, c.HisIp, c.HisPort, ConsultTime, DisplayName AS ExpName, ExpID, d.Diagnosis,"
                    + " ( SELECT CenterName FROM Center h WHERE b.CenterID = h.CenterID ) AS CenterName, "
                    + " ( SELECT CenterName FROM Center h WHERE b.OldCenterID = h.CenterID ) AS OldCenterName, "
                    + " ( SELECT DiagnosisTime FROM Diagnosis f WHERE f.ConsultID = b.ConsultID ) AS DiagnosisTime, "
                    + "( SELECT ChargeMoney FROM Charge g WHERE b.MoneyID = g.ID ) AS ChargeMoney "
                    + " FROM Cases a, Consultation b, Hospital c, Diagnosis d, users e "
                    + " WHERE d.ConsultID = b.ConsultID AND e.userID = d.ExpId AND a.ConsultID = b.ConsultID AND b.HisID = c.HisID "
                    + " AND ( b.ConsultStatusID != 0 AND b.ConsultStatusID != 99 AND b.ConsultStatusID != 100 AND b.ConsultStatusID != -88 ) "
                    + " AND 1 = 1 " + whereArgs
                    + " ) C WHERE RowNumber BETWEEN @start AND @end";

            DataTable data = context.Sql(sql)
                .Parameter("start", Convert.ToString(param.Start))
                .Parameter("end", Convert.ToString(param.End))
                .QuerySingle<DataTable>();

            // 获取当前获取的数据总量
            int currentCount = data.Rows.Count + param.Start - 1;

            int dataCount = context.Sql(string.Format("select count(*) from Cases a ,Consultation b,Hospital c ,Diagnosis d,users e "
                + "where d.ConsultID=b.ConsultID and e.userID=d.ExpId and a.ConsultID=b.ConsultID and b.HisID=c.HisID and (b.ConsultStatusID !=0 and b.ConsultStatusID !=99 and b.ConsultStatusID !=100 and b.ConsultStatusID !=-88 )  and 1=1 {0}", whereArgs)).QuerySingle<int>();

            return "{\"currentCount\":\"" + currentCount + "\",\"dataCount\":\"" + dataCount + "\",\"Rows\":" + JsonConvert.SerializeObject(data) + "}";

        }

        //省肿瘤 2016+00001
        public string GetConsultLastID_zl()
        {
            IDbContext subContext = DBContext.get().getIDbContext();
            using (IDbContext transaction = subContext.UseTransaction(true))
            {
                string str = DateTime.Now.ToString("yyyy") + "00001";
                string sql = "select *  from Consultation where ConsultNo = '" + str + "'";
                DataTable dt = subContext.Sql(sql).QuerySingle<DataTable>();
                if (dt.Rows.Count > 0)
                {
                    sql = "select ConsultNo+1 as ConsultNo  from Consultation  a where not exists"
                        + "(select 1 from Consultation b where b.ConsultNo=a.ConsultNo + 1 and ConsultStatusID!=-77) and ConsultStatusID!=-77 and datediff(year,ConsultTime,getdate()) "
                        + " = 0  order by ConsultNo";
                    DataTable dt1 = subContext.Sql(sql).QuerySingle<DataTable>();
                    if (dt1.Rows.Count > 0)
                    {
                        str = dt1.Rows[0]["ConsultNo"].ToString();
                    }
                }

                transaction.Commit();

                return str;
            }
        }
    }
}