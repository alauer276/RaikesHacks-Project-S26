using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;
using MailKit.Net.Smtp;

namespace RaikesHacks_Project_S26.Controllers 
{
    /// <summary>
    /// Controller for handling email related API endpoints.
    /// </summary>
    [ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
    }
}