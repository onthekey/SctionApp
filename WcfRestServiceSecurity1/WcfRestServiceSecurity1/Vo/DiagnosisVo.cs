using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.Vo
{
    public class DiagnosisVo
    {
        public string ConsultID
        {
            get; set;
        }
        public string TextDiagnosis
        {
            get; set;
        }
        public string Diagnosis_Remark
        {
            get; set;
        }
        public string RecheckReturn {
            get;set;
        }
        public string IsPublisher {
            get;set;
        }
    }
}