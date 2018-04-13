using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.Vo
{
    public class DraftVo
    {
        public int ConsultID
        {
            get; set;
        }
        public string Diagnosis
        {
            get; set;
        }
        public string Diagnosis_Remark
        {
            get; set;
        }
        public int UserID
        {
            get; set;
        }
        public string Mirror {
            get;set;
        }
    }
}