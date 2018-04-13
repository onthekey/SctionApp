using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.entity
{
    public class SiteStatisticsParam
    {
        private string startDtae;
        private string endDate;
        private string diagnosisStartDate;
        private string diagnosisEndDate;
        private string hospitalId;

        public SiteStatisticsParam(string startDtae, string endDate, string diagnosisStartDate, string diagnosisEndDate, string hospitalId) {
            this.startDtae = startDtae == null ? "" : startDtae;
            this.endDate = endDate == null ? "" : endDate;
            this.diagnosisStartDate = diagnosisStartDate == null ? "" : diagnosisStartDate;
            this.DiagnosisEndDate = DiagnosisEndDate == null ? "" : DiagnosisEndDate;
            this.hospitalId = hospitalId == null ? "" : hospitalId;
        }

        public string StartDtae
        {
            get { return startDtae; }
            set { startDtae = value; }
        }
        
        public string EndDate
        {
            get { return endDate; }
            set { endDate = value; }
        }

        public string DiagnosisStartDate
        {
            get { return diagnosisStartDate; }
            set { diagnosisStartDate = value; }
        }

        public string DiagnosisEndDate
        {
            get { return diagnosisEndDate; }
            set { diagnosisEndDate = value; }
        }

        public string HospitalId
        {
            get { return hospitalId; }
            set { hospitalId = value; }
        }
    }
}