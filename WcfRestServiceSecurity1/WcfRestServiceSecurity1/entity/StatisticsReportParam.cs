using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

using Newtonsoft.Json;

namespace MoblieRestService.entity
{
    public class StatisticsReportParam
    {
        private int userId;
        private string consultIdStatusId;
        private string caseTypeId;
        private string search;
        private string startDate;
        private string endDate;
        private int start;
        private int end;

        public StatisticsReportParam(int userId, string consultIdStatusId, string caseTypeId, string search, string startDate, string endDate, int start, int end)
        {
            this.userId = userId;
            this.consultIdStatusId = consultIdStatusId;
            this.caseTypeId = caseTypeId;
            this.search = search;
            this.startDate = startDate;
            this.endDate = endDate;
            this.start = start;
            this.end = end;
        }

        [XmlElement("UserId", IsNullable = true)]
        [JsonPropertyAttribute("UserId")]
        public int UserId
        {
            get { return userId; }
            set { userId = value; }
        }

        [XmlElement("ConsultIdStatusId", IsNullable = true)]
        [JsonPropertyAttribute("ConsultIdStatusId")]
        public string ConsultIdStatusId
        {
            get { return consultIdStatusId; }
            set { consultIdStatusId = value; }
        }

        [XmlElement("CaseTypeId", IsNullable = true)]
        [JsonPropertyAttribute("CaseTypeId")]
        public string CaseTypeId
        {
            get { return caseTypeId; }
            set { caseTypeId = value; }
        }

        [XmlElement("Search", IsNullable = true)]
        [JsonPropertyAttribute("Search")]
        public string Search
        {
            get { return search; }
            set { search = value; }
        }

        [XmlElement("StartDate", IsNullable = true)]
        [JsonPropertyAttribute("StartDate")]
        public string StartDate
        {
            get { return startDate; }
            set { startDate = value; }
        }

        [XmlElement("EndDate", IsNullable = true)]
        [JsonPropertyAttribute("EndDate")]
        public string EndDate
        {
            get { return endDate; }
            set { endDate = value; }
        }

        [XmlElement("Start", IsNullable = true)]
        [JsonPropertyAttribute("Start")]
        public int Start
        {
            get { return start; }
            set { start = value; }
        }

        [XmlElement("End", IsNullable = true)]
        [JsonPropertyAttribute("End")]
        public int End
        {
            get { return end; }
            set { end = value; }
        }
    }
}