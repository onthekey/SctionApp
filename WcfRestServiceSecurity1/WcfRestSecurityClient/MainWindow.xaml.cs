using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Net;
using System.Runtime.Serialization.Json;
using System.IO;
using System.Runtime.Serialization;
using Microsoft.Http;

namespace WcfRestSecurityClient
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }
        
        private void DisplayResult(HttpResponseMessage response)
        {
            txtStatusCode.Text = response.StatusCode.ToString();
            this.textBox1.Text = response.Content.ReadAsString();
        }

        private void btnInvokeWithAuth_Click(object sender, RoutedEventArgs e)
        {
            var url = txtUrl.Text;
            var client = new HttpClient();
            client.DefaultHeaders.Add("Authorization", "fangxing/123");
            var resp = client.Get(url);
            DisplayResult(resp);
        }

        private void btnInvokeWithoutAuth_Click(object sender, RoutedEventArgs e)
        {
            var url = txtUrl.Text;
            var client = new HttpClient();
            var resp = client.Get(url);
            DisplayResult(resp);
        }

    }
}