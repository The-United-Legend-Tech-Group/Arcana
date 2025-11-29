import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { JobTemplateDocument } from './models/job-template.schema';
import { JobRequisitionDocument } from './models/job-requisition.schema';
import { DocumentDocument } from './models/document.schema';
import { ApplicationDocument } from './models/application.schema';
import { InterviewDocument } from './models/interview.schema';

import { InterviewStatus } from './enums/interview-status.enum';

import { CreateJobTemplateDto } from './dtos/create-job-template.dto';
import { CreateJobRequisitionDto } from './dtos/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dtos/update-jobrequisition.dto';
import { CreateCVDocumentDto } from './dtos/create-cv-document.dto';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { SendNotificationDto } from './dtos/send-notification.dto';


@ApiTags('Recruitment')
@Controller()
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) { }

  @Get()
  getHello(): string {
    return this.recruitmentService.getHello();
  }
  //REC-003
  @ApiOperation({ summary: 'Create a new job template', description: 'Creates a reusable job template with title, department, qualifications and skills' })
  @ApiBody({ type: CreateJobTemplateDto, description: 'Job template data including title, department, qualifications and required skills' })
  @ApiResponse({ status: 201, description: 'Job template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data - validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('createTemplate')
  async createJobTemplate(@Body() CreateJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplateDocument> {
    return await this.recruitmentService.createjob_template(CreateJobTemplateDto)
  }

  @ApiOperation({ summary: 'Create a new job requisition' })
  @ApiBody({ type: CreateJobRequisitionDto })
  @ApiResponse({ status: 201, description: 'Job requisition created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  @Post('Requisition')
  async createJobRequisition(@Body() CreateJobRequisitionDto: CreateJobRequisitionDto): Promise<JobRequisitionDocument> {
    return await this.recruitmentService.createjob_requision(CreateJobRequisitionDto)
  }

  //HELPS IN Doing REC-0023
  @ApiOperation({ summary: 'Update job requisition by ID', description: 'Updates an existing job requisition with new data. Used for modifying posting dates, requirements, or status.' })
  @ApiParam({ name: 'requisitionid', description: 'Unique job requisition identifier', example: 'REQ-2024-001', type: 'string' })
  @ApiBody({ type: UpdateJobRequisitionDto, description: 'Updated job requisition data - only provided fields will be updated' })
  @ApiResponse({ status: 200, description: 'Job requisition updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or validation failed' })
  @ApiResponse({ status: 404, description: 'Job requisition with specified ID not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch('Rrequisition/:requisitionid')
  async updateJobRequision(@Param('requisitionid') id: string, @Body() UpdateJobRequisitionDto: UpdateJobRequisitionDto): Promise<JobRequisitionDocument> {
    return await this.recruitmentService.updatejob_requisition(id, UpdateJobRequisitionDto)
  }
  //REC-0023
  @ApiOperation({ summary: 'Get all published job requisitions', description: 'Retrieves all job requisitions that are currently published and available for applications' })
  @ApiResponse({ status: 200, description: 'List of published job requisitions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('Requisition/published')
  async getAllPublishedRequistions(): Promise<JobRequisitionDocument[]> {
    return await this.recruitmentService.getAllpublishedJobRequisition();
  }

  //REC-007
  @ApiOperation({ summary: 'Upload CV document', description: 'Uploads and stores a candidate CV document with metadata for recruitment purposes' })
  @ApiBody({ type: CreateCVDocumentDto, description: 'CV document data including file information and candidate reference' })
  @ApiResponse({ status: 201, description: 'CV document uploaded and stored successfully' })
  @ApiResponse({ status: 400, description: 'Invalid document data - validation failed or unsupported file type' })
  @ApiResponse({ status: 500, description: 'Internal server error or file storage failed' })
  @Post('CVdocument')
  async uploadDocument(@Body() documentDto: CreateCVDocumentDto): Promise<DocumentDocument> {
    return this.recruitmentService.createCVDocument(documentDto);
  }

  //REC-007
  @ApiOperation({ summary: 'Create a new job application', description: 'Submits a candidate application for a specific job requisition. Automatically sets initial status and stage.' })
  @ApiBody({ type: CreateApplicationDto, description: 'Application data linking candidate to job requisition with optional HR assignment' })
  @ApiResponse({ status: 201, description: 'Job application created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid application data - validation failed or duplicate application' })
  @ApiResponse({ status: 404, description: 'Referenced job requisition or candidate not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('Application')
  async createApplication(@Body() createApplicationDto: CreateApplicationDto): Promise<ApplicationDocument> {
    return this.recruitmentService.createApplication(createApplicationDto);
  }
  //REC-017 part 1
  @ApiOperation({ summary: 'Get all applications for a specific candidate' })
  @ApiParam({ name: 'candidateId', description: 'Candidate MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'List of candidate applications', type: [Object] })
  @ApiResponse({ status: 400, description: 'Invalid candidate ID format' })
  @Get('Application/:candidateId')
  async getApplicationsByCandidate(@Param('candidateId') candidateId: string): Promise<ApplicationDocument[]> {
    return this.recruitmentService.getallcandidateApplications(candidateId);
  }

  //REC-017 part 2: Update Application Status/Stage
  @ApiOperation({
    summary: 'Update application status and stage',
    description: 'Updates application status/stage and sends notifications. To schedule interviews when moving to hr_interview or department_interview stages, use the separate POST /Interview endpoint after updating the application stage.'
  })
  @ApiParam({ name: 'applicationId', description: 'Application MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateApplicationDto })
  @ApiResponse({ status: 200, description: 'Application updated successfully and history recorded. Notifications sent to candidate and HR.' })
  @ApiResponse({ status: 404, description: 'Application or job requisition not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Patch('Application/:applicationId')
  async updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationDto: UpdateApplicationDto
  ): Promise<ApplicationDocument> {
    return this.recruitmentService.updateApplication(applicationId, updateApplicationDto);
  }

  @ApiOperation({ summary: 'Send manual notification for application change' })
  @ApiParam({ name: 'applicationId', description: 'Application MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: SendNotificationDto, required: false })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 500, description: 'Failed to send notification' })
  @Post('Application/:applicationId/notify')
  async sendApplicationNotification(
    @Param('applicationId') applicationId: string,
    @Body() notificationData?: SendNotificationDto
  ): Promise<{ message: string }> {
    await this.recruitmentService.notifyApplicationChange(
      applicationId,
      notificationData?.candidateId,
      notificationData?.hrId,
      notificationData?.customMessage
    );
    return { message: 'Notification sent successfully' };
  }

  // =================== INTERVIEW ENDPOINTS ===================
  //REC -010
  @ApiOperation({
    summary: 'Create interview for application (Manual HR Process)',
    description: 'HR manually creates and schedules interviews for applications in hr_interview or department_interview stages. This allows HR to carefully select interviewers and schedule at appropriate times. Automatically sends notifications to candidate, HR, and selected panel members.'
  })
  @ApiBody({ type: CreateInterviewDto })
  @ApiResponse({ status: 201, description: 'Interview created successfully and notifications sent to candidate, HR, and panel members' })
  @ApiResponse({ status: 404, description: 'Application not found or invalid stage' })
  @ApiResponse({ status: 400, description: 'Invalid interview data' })
  @Post('Interview')
  async createInterview(@Body() createInterviewDto: CreateInterviewDto): Promise<InterviewDocument> {
    return this.recruitmentService.createInterview(createInterviewDto);
  }

  @ApiOperation({ summary: 'Get interviews for application', description: 'Retrieves all interviews scheduled for a specific application including past and upcoming interviews' })
  @ApiParam({ name: 'applicationId', description: 'Application MongoDB ObjectId - must be a valid ObjectId format', example: '507f1f77bcf86cd799439011', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of interviews for the application retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid application ID format - must be valid MongoDB ObjectId' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('Interview/Application/:applicationId')
  async getInterviewsByApplication(@Param('applicationId') applicationId: string): Promise<InterviewDocument[]> {
    return this.recruitmentService.getInterviewByApplication(applicationId);
  }

  /*@ApiOperation({ summary: 'Get interviews for application by stage' })
  @ApiParam({ name: 'applicationId', description: 'Application MongoDB ObjectId', example: '507f1f77bcf86cd799439011' })
  @ApiParam({ name: 'stage', description: 'Interview stage', enum: ApplicationStage })
  @ApiResponse({ status: 200, description: 'List of interviews for the application and stage', type: [Object] })
  @Get('Interview/Application/:applicationId/Stage/:stage')
  async getInterviewsByApplicationAndStage(
    @Param('applicationId') applicationId: string,
    @Param('stage') stage: ApplicationStage
  ): Promise<InterviewDocument[]> {
    return this.recruitmentService.getInterviewByApplication(applicationId, stage);
  }*/
  //REC-011 & RE-020
  @ApiOperation({ summary: 'Update interview status and send notifications', description: 'Updates interview status (completed, cancelled, etc.) and sends notifications to candidate, HR, and panel members. Can include optional feedback.' })
  @ApiParam({ name: 'interviewId', description: 'Interview MongoDB ObjectId - must be a valid ObjectId format', example: '507f1f77bcf86cd799439011', type: 'string' })
  @ApiParam({ name: 'status', description: 'New interview status', enum: ['scheduled', 'completed', 'cancelled', 'no_show'], example: 'completed', type: 'string' })
  @ApiBody({ description: 'Optional feedback data', required: false, schema: { type: 'object', properties: { candidateFeedback: { type: 'string', description: 'Feedback about the candidate performance', example: 'Candidate demonstrated strong technical skills but needs improvement in communication' } } } })
  @ApiResponse({ status: 200, description: 'Interview status updated successfully and notifications sent' })
  @ApiResponse({ status: 400, description: 'Invalid interview ID format or status value' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch('Interview/:interviewId/Status/:status')
  async updateInterviewStatus(
    @Param('interviewId') interviewId: string,
    @Param('status') status: InterviewStatus,
    @Body() feedbackData?: { candidateFeedback?: string }
  ): Promise<InterviewDocument> {
    return this.recruitmentService.updateInterviewStatus(
      interviewId,
      status,
      feedbackData?.candidateFeedback
    );
  }
}
