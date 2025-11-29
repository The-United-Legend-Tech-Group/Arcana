import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobTemplate, JobTemplateDocument } from './models/job-template.schema';
import { JobRequisition, JobRequisitionDocument } from './models/job-requisition.schema';
import { Document, DocumentDocument } from './models/document.schema';
import { Application, ApplicationDocument } from './models/application.schema';
import { ApplicationStatusHistory, ApplicationStatusHistoryDocument } from './models/application-history.schema';
import { Interview, InterviewDocument } from './models/interview.schema';

import { NotificationService } from '../employee-subsystem/notification/notification.service';
import { ApplicationStage } from './enums/application-stage.enum';
import { ApplicationStatus } from './enums/application-status.enum';

import { CreateJobTemplateDto } from './dtos/create-job-template.dto';
import { CreateJobRequisitionDto } from './dtos/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dtos/update-jobrequisition.dto';
import { CreateCVDocumentDto } from './dtos/create-cv-document.dto';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { CreateNotificationDto } from '../employee-subsystem/notification/dto/create-notification.dto';

import { InterviewStatus } from './enums/interview-status.enum';
import { InterviewMethod } from './enums/interview-method.enum';

import { EmployeeProfileRepository } from '../employee-subsystem/employee/repository/employee-profile.repository';
import { CandidateRepository } from '../employee-subsystem/employee/repository/candidate.repository';
import { EmployeeSystemRoleRepository } from '../employee-subsystem/employee/repository/employee-system-role.repository';
import { SystemRole, EmployeeStatus } from '../employee-subsystem/employee/enums/employee-profile.enums';
import { EmployeeProfileDocument } from '../employee-subsystem/employee/models/employee-profile.schema';
//import { EmployeeModule } from '../employee-subsystem/employee/employee.module';
//import { EmployeeProfileRepository } from '../employee-subsystem/employee/repository/employee-profile.repository';
//import { EmployeeProfile } from '../employee-subsystem/employee/models/employee-profile.schema';
@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(JobRequisition.name) private jobRequisitionModel: Model<JobRequisitionDocument>,
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(ApplicationStatusHistory.name) private applicationHistoryModel: Model<ApplicationStatusHistoryDocument>,
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    private readonly notificationService: NotificationService,
    private readonly employeeProfileRepository: EmployeeProfileRepository,
    private readonly candidateRepository: CandidateRepository,
    private readonly employeeSystemRoleRepository: EmployeeSystemRoleRepository,
  ) { }

  async validateEmployeeExistence(employeeId: string, roles: SystemRole[]): Promise<boolean> {
    try {
      const employee = await this.employeeProfileRepository.findById(employeeId);

      if (!employee) {
        return false;
      }

      const employeeObj = employee.toObject ? employee.toObject() : employee;

      // Check if employee has HR role and is active
      const isHR = await this.checkIfEmployeeIsAsExpected(employeeObj, roles);
      const isActive = this.checkIfEmployeeIsActive(employeeObj);

      return isHR && isActive;
    } catch (error) {
      // If getProfile throws NotFoundException, HR doesn't exist
      return false;
    }
  }

  // Helper method to check if employee has HR role
  private async checkIfEmployeeIsAsExpected(employee: EmployeeProfileDocument | any, roles: SystemRole[]): Promise<boolean> {
    try {
      const employeeId = employee._id || employee.id;

      // Find the employee's system roles
      const employeeSystemRole = await this.employeeSystemRoleRepository.findOne({
        employeeProfileId: new Types.ObjectId(employeeId),
        isActive: true
      });

      if (!employeeSystemRole) {
        return false;
      }

      // Check if employee has any HR-related role

      return employeeSystemRole.roles.some(role => roles.includes(role));
    } catch (error) {
      console.error('Error checking HR role:', error);
      return false;
    }
  }

  // Helper method to check if employee is active
  private checkIfEmployeeIsActive(employee: EmployeeProfileDocument | any): boolean {
    try {
      return employee.status === EmployeeStatus.ACTIVE;
    } catch (error) {
      console.error('Error checking employee status:', error);
      return false;
    }
  }

  private async validateCandidateExistence(candidateId: string): Promise<boolean> {
    try {
      const candidate = await this.candidateRepository.findById(candidateId);
      if (!candidate) {
        return false;
      }
      return true;
    }
    catch (error) {
      // If getProfile throws NotFoundException, candidate doesn't exist
      return false;
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  //REC-003: Create Job Template and Job Requisition
  async createjob_template(createjob_template: CreateJobTemplateDto): Promise<JobTemplateDocument> {
    const template = new this.jobTemplateModel(createjob_template)
    return await template.save()
  }
  async createjob_requision(createjob_requision: CreateJobRequisitionDto): Promise<JobRequisitionDocument> {
    const templateExists = await this.jobTemplateModel.findById(createjob_requision.templateId).lean();
    if (!templateExists) {
      throw new NotFoundException(`Job template with id ${createjob_requision.templateId} not found`);
    }
    if (createjob_requision.openings <= 0) {
      throw new NotFoundException(`Number of openings must be greater than zero`);
    }
    if (!createjob_requision.hiringManagerId) {
      throw new NotFoundException(`Hiring Manager ID is required`);
    }
    const isHiringManagerValid = await this.validateEmployeeExistence(createjob_requision.hiringManagerId, [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN]);
    if (!isHiringManagerValid) {
      throw new NotFoundException(`Hiring Manager with id ${createjob_requision.hiringManagerId} is not valid or not active`);
    }
    const requisition = new this.jobRequisitionModel(createjob_requision);
    return await requisition.save()
  }

  //HELPS IN Doing REC-023
  async updatejob_requisition(requisitionId: string, updatejob_requisition: UpdateJobRequisitionDto): Promise<JobRequisitionDocument> {
    const templateExists = await this.jobTemplateModel.findById(updatejob_requisition.templateId).lean();
    if (!templateExists) {
      throw new NotFoundException(`Job template with id ${updatejob_requisition.templateId} not found`);
    }
    if (updatejob_requisition.openings !== undefined && updatejob_requisition.openings <= 0) {
      throw new NotFoundException(`Number of openings must be greater than zero`);
    }
    //if () {} can check who will be updating 
    const requisition = await this.jobRequisitionModel.findOneAndUpdate(
      { requisitionId: requisitionId }, // Correct: plain object filter
      updatejob_requisition,
      { new: true }
    );

    if (!requisition) {
      throw new NotFoundException(`Job requisition with requisitionId ${requisitionId} not found`);
    }

    return requisition;
  }
  // REC:-023
  async getAllpublishedJobRequisition(): Promise<JobRequisitionDocument[]> {
    // can add validation for who is requesting
    return this.jobRequisitionModel
      .find({ publishStatus: 'published' })
      //.populate('templateId')
      //.populate('hiringManagerId', 'name email')
      .exec();
  }
  // REC-007: Create CV Document
  async createCVDocument(createCVDocumentDto: CreateCVDocumentDto): Promise<DocumentDocument> {
    const isCandidateValid = await this.validateCandidateExistence(createCVDocumentDto.ownerId);
    if (!isCandidateValid) {
      throw new NotFoundException(`Candidate with id ${createCVDocumentDto.ownerId} is not valid or not active`);
    }
    if (createCVDocumentDto.type != 'cv') {
      throw new NotFoundException(`Document type must be 'cv'`);
    }

    const document = new this.documentModel({
      ...createCVDocumentDto,
      uploadedAt: createCVDocumentDto.uploadedAt || new Date()
    }); return await document.save();
  }

  //REC-007: Create Application
  async createApplication(createApplicationDto: CreateApplicationDto): Promise<ApplicationDocument> {
    // Find the requisition by user-defined requisitionId
    const requisition = await this.jobRequisitionModel.findOne({ requisitionId: createApplicationDto.requisitionId }).lean();
    if (!requisition) {
      throw new NotFoundException(`Job requisition with id ${createApplicationDto.requisitionId} not found`);
    }
    const isCandidateValid = await this.validateCandidateExistence(createApplicationDto.candidateId);
    if (!isCandidateValid) {
      throw new NotFoundException(`Candidate with id ${createApplicationDto.candidateId} is not valid or not active`);
    }
    // Check if application already exists for this candidate and requisition
    const existingApplication = await this.applicationModel.findOne({
      candidateId: new Types.ObjectId(createApplicationDto.candidateId),
      requisitionId: requisition._id
    }).lean();

    if (existingApplication) {
      throw new Error(`Application already exists for candidate ${createApplicationDto.candidateId} and requisition ${createApplicationDto.requisitionId}`);
    }

    const application = new this.applicationModel({
      candidateId: new Types.ObjectId(createApplicationDto.candidateId),
      requisitionId: requisition._id, // Use the MongoDB _id of the found requisition
      assignedHr: createApplicationDto.assignedHr ? new Types.ObjectId(createApplicationDto.assignedHr) : undefined
    });

    return application.save();
  }
  //could be REC-017 ,related ,also need to add validation for it being hr or candidate
  async getApplicationById(applicationId: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findById(applicationId).exec();
    if (!application) {
      throw new NotFoundException(`Application with id ${applicationId} not found`);
    }
    return application;
  }
  //REC-017 part 1 also need to add validation for it being hr or candidate
  async getallcandidateApplications(candidateId: string): Promise<ApplicationDocument[]> {
    if (!await this.validateCandidateExistence(candidateId)) {
      throw new NotFoundException(`Candidate with id ${candidateId} is not valid or not active`);
    }
    return this.applicationModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .exec();
  }

  // REC-017 part2 & REC-022: Update Application Status/Stage by candidateId and requisitionId
  async updateApplication(applicationId: string, updateApplicationDto: UpdateApplicationDto): Promise<ApplicationDocument> {
    // Validate HR exists and has proper role
    const isValidHR = await this.validateEmployeeExistence(updateApplicationDto.hrId, [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.HR_EMPLOYEE]);
    if (!isValidHR) {
      throw new NotFoundException(`HR with id ${updateApplicationDto.hrId} is not valid or not active`);
    }

    // Use the ID from DTO if provided, otherwise use the parameter
    const targetApplicationId = applicationId;

    // Find the application to update
    const currentApplication = await this.applicationModel.findById(targetApplicationId).exec();
    if (!currentApplication) {
      throw new NotFoundException(`Application with id ${targetApplicationId} not found`);
    }

    // Prepare update data (exclude id and hrId from the update)
    const { hrId, ...updateData } = updateApplicationDto;

    // Update the application directly by ID
    const updatedApplication = await this.applicationModel.findByIdAndUpdate(
      targetApplicationId,
      updateData,
      { new: true }
    );

    if (!updatedApplication) {
      throw new NotFoundException(`Failed to update application with id ${targetApplicationId}`);
    }

    // Create history record if there were changes
    if (updateApplicationDto.currentStage || updateApplicationDto.status) {
      const historyRecord = new this.applicationHistoryModel({
        applicationId: currentApplication._id,
        oldStage: currentApplication.currentStage,
        newStage: updateApplicationDto.currentStage || currentApplication.currentStage,
        oldStatus: currentApplication.status,
        newStatus: updateApplicationDto.status || currentApplication.status,
        changedBy: new Types.ObjectId(updateApplicationDto.hrId) // TODO: Replace with actual user ID from auth context
      });

      await historyRecord.save();
    }

    // Create interview if needed (when stage changes to interview and interview data provided)
    /*  if (updateApplicationDto.interviewData) {
        await this.autoCreateInterviewIfNeeded(
          updatedApplication,
          currentApplication,
          updateApplicationDto.interviewData
        );
      }*/

    // Get requisition details for notification
    const requisition = await this.jobRequisitionModel.findById(updatedApplication.requisitionId).exec();
    const requisitionId = requisition?.requisitionId || 'Unknown';

    // Send notifications after successful update
    await this.sendApplicationStatusNotification(
      updatedApplication,
      currentApplication,
      requisitionId
    );

    return updatedApplication;
  }

  /**
   * Send notifications to candidate and HR when application status or stage changes
   
  REC-008
  REC-022*/
  async sendApplicationStatusNotification(
    updatedApplication: ApplicationDocument,
    previousApplication: ApplicationDocument,
    requisitionId: string
  ): Promise<void> {
    const recipients: string[] = [];

    // Add candidate to recipients
    recipients.push(updatedApplication.candidateId.toString());

    // Add assigned HR to recipients if exists
    if (updatedApplication.assignedHr) {
      recipients.push(updatedApplication.assignedHr.toString());
    }

    const statusChanged = updatedApplication.status !== previousApplication.status;
    const stageChanged = updatedApplication.currentStage !== previousApplication.currentStage;

    if (statusChanged || stageChanged) {
      const notificationData: CreateNotificationDto = {
        recipientId: recipients,
        type: this.getNotificationType(updatedApplication.status),
        deliveryType: 'MULTICAST',
        title: 'Application Status Update',
        message: this.buildNotificationMessage(
          updatedApplication,
          previousApplication,
          requisitionId,
          statusChanged,
          stageChanged
        ),
        relatedEntityId: updatedApplication._id.toString(),
        relatedModule: 'Recruitment',
        isRead: false,
      };

      try {
        await this.notificationService.create(notificationData);
      } catch (error) {
        console.error('Failed to send application status notification:', error);
        // Don't throw error to prevent breaking the main application update flow
      }
    }
  }

  /**
   * Get notification type based on application status
   */
  private getNotificationType(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.HIRED:
        return 'Success';
      case ApplicationStatus.OFFER:
        return 'Info';
      case ApplicationStatus.REJECTED:
        return 'Alert';
      case ApplicationStatus.IN_PROCESS:
      case ApplicationStatus.SUBMITTED:
        return 'Info';
      default:
        return 'Info';
    }
  }

  /**
   * Build notification message based on changes
   */
  private buildNotificationMessage(
    updatedApplication: ApplicationDocument,
    previousApplication: ApplicationDocument,
    requisitionId: string,
    statusChanged: boolean,
    stageChanged: boolean
  ): string {
    let message = `Your application for job requisition ${requisitionId} has been updated. `;

    if (statusChanged) {
      message += `Status changed from "${previousApplication.status}" to "${updatedApplication.status}". `;
    }

    if (stageChanged) {
      message += `Stage changed from "${previousApplication.currentStage}" to "${updatedApplication.currentStage}". `;
    }

    // Add specific messages based on status
    switch (updatedApplication.status) {
      case ApplicationStatus.HIRED:
        message += 'Congratulations! You have been selected for the position.';
        break;
      case ApplicationStatus.OFFER:
        message += 'An offer has been extended. Please check your email for details.';
        break;
      case ApplicationStatus.REJECTED:
        message += 'Unfortunately, your application was not successful this time.';
        break;
      case ApplicationStatus.IN_PROCESS:
        message += 'Your application is currently being reviewed.';
        break;
    }

    return message;
  }

  /**
   * Public method to manually send notifications for application changes
   * This can be called from controllers or other services when needed
   */
  async notifyApplicationChange(
    applicationId: string,
    candidateId?: string,
    hrId?: string,
    customMessage?: string
  ): Promise<void> {
    const application = await this.getApplicationById(applicationId);
    const recipients: string[] = [];

    // Add specified recipients or use application defaults
    if (candidateId) {
      recipients.push(candidateId);
    } else {
      recipients.push(application.candidateId.toString());
    }

    if (hrId) {
      recipients.push(hrId);
    } else if (application.assignedHr) {
      recipients.push(application.assignedHr.toString());
    }

    const notificationData: CreateNotificationDto = {
      recipientId: recipients,
      type: 'Info',
      deliveryType: 'MULTICAST',
      title: 'Application Update',
      message: customMessage || `There has been an update to your application (ID: ${applicationId}).`,
      relatedEntityId: applicationId,
      relatedModule: 'Recruitment',
      isRead: false,
    };

    try {
      await this.notificationService.create(notificationData);
    } catch (error) {
      console.error('Failed to send manual application notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  // =================== INTERVIEW METHODS ===================

  /**
   * Create interview document for application
   */
  async createInterview(createInterviewDto: CreateInterviewDto): Promise<InterviewDocument> {
    // Validate application exists
    const application = await this.getApplicationById(createInterviewDto.applicationId);
    if (!application) {
      throw new NotFoundException(`Application with id ${createInterviewDto.applicationId} not found`);
    }
    if (!createInterviewDto.panel || createInterviewDto.panel.length === 0) {
      throw new NotFoundException('At least one interviewer/panel member is required to schedule an interview');
    }
    if (createInterviewDto.scheduledDate <= new Date()) {
      throw new NotFoundException('Scheduled date and time for the interview must be in the future');
    }
    if (createInterviewDto.method === InterviewMethod.VIDEO && !createInterviewDto.videoLink) {
      throw new NotFoundException('Video link is required for video interviews');
    }
    if (createInterviewDto.method !== InterviewMethod.VIDEO && createInterviewDto.videoLink) {
      throw new NotFoundException('Video link should not be provided for non-video interviews');
    }
    if (new Set(createInterviewDto.panel).size !== createInterviewDto.panel.length) {
      throw new NotFoundException('Duplicate panel member IDs are not allowed');
    }
    // Validate stage is interview-related
    if (createInterviewDto.stage !== ApplicationStage.HR_INTERVIEW &&
      createInterviewDto.stage !== ApplicationStage.DEPARTMENT_INTERVIEW) {
      throw new NotFoundException('Interview can only be created for HR or Department interview stages');
    }

    const interview = new this.interviewModel({
      applicationId: new Types.ObjectId(createInterviewDto.applicationId),
      stage: createInterviewDto.stage,
      scheduledDate: createInterviewDto.scheduledDate,
      method: createInterviewDto.method,
      panel: createInterviewDto.panel.map(id => new Types.ObjectId(id)),
      calendarEventId: createInterviewDto.calendarEventId,
      videoLink: createInterviewDto.videoLink,
      status: createInterviewDto.status || InterviewStatus.SCHEDULED,
    });

    const savedInterview = await interview.save();

    // Send notification about interview scheduling
    await this.sendInterviewNotification(savedInterview, application, 'scheduled');

    return savedInterview;
  }

  /**
   * Get interview by application ID and stage
   */
  async getInterviewByApplication(applicationId: string): Promise<InterviewDocument[]> {
    const filter: any = { applicationId: new Types.ObjectId(applicationId) };

    return this.interviewModel.find(filter)
      .populate('applicationId')
      .populate('panel', 'name email')
      .exec();
  }

  /**
   * Update interview status and send notifications
   */
  async updateInterviewStatus(
    interviewId: string,
    status: InterviewStatus,
    candidateFeedback?: string
  ): Promise<InterviewDocument> {
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException(`Interview with id ${interviewId} not found`);
    }
    if (interview.status === status) {
      throw new NotFoundException(`Interview is already in status ${status}`);
    }
    if (interview.scheduledDate > new Date() && status === InterviewStatus.COMPLETED) {
      throw new NotFoundException('Cannot mark interview as COMPLETED before its scheduled date and time');
    }
    if (interview.status === InterviewStatus.CANCELLED) {
      throw new NotFoundException('Cannot update status of a CANCELLED interview');
    }
    if (interview.status === InterviewStatus.COMPLETED) {
      throw new NotFoundException('Cannot update status of a COMPLETED interview');
    }

    const application = await this.getApplicationById(interview.applicationId.toString());

    interview.status = status;
    if (candidateFeedback) {
      interview.candidateFeedback = candidateFeedback;
    }

    const updatedInterview = await interview.save();

    // Send notification about interview status update
    await this.sendInterviewNotification(updatedInterview, application, status);

    return updatedInterview;
  }

  /**
   * Send interview-related notifications
   */
  private async sendInterviewNotification(
    interview: InterviewDocument,
    application: ApplicationDocument,
    action: string
  ): Promise<void> {
    const recipients: string[] = [];

    // Add candidate to recipients
    recipients.push(application.candidateId.toString());

    // Add assigned HR to recipients if exists
    if (application.assignedHr) {
      recipients.push(application.assignedHr.toString());
    }

    // Add panel members to recipients
    if (interview.panel && Array.isArray(interview.panel)) {
      interview.panel.forEach(panelMember => {
        recipients.push(panelMember.toString());
      });
    }

    let title = '';
    let message = '';
    let notificationType = 'Info';

    switch (action) {
      case 'scheduled':
        title = 'Interview Scheduled';
        message = `Your ${interview.stage.replace('_', ' ')} interview has been scheduled for ${interview.scheduledDate.toLocaleDateString()} at ${interview.scheduledDate.toLocaleTimeString()}. Method: ${interview.method}`;
        if (interview.videoLink) {
          message += ` Video Link: ${interview.videoLink}`;
        }
        break;
      case InterviewStatus.COMPLETED:
        title = 'Interview Completed';
        message = `Your ${interview.stage.replace('_', ' ')} interview has been completed. You will be notified of the next steps soon.`;
        notificationType = 'Success';
        break;
      case InterviewStatus.CANCELLED:
        title = 'Interview Cancelled';
        message = `Your ${interview.stage.replace('_', ' ')} interview scheduled for ${interview.scheduledDate.toLocaleDateString()} has been cancelled. You will be contacted to reschedule.`;
        notificationType = 'Alert';
        break;
      default:
        title = 'Interview Update';
        message = `There has been an update to your ${interview.stage.replace('_', ' ')} interview.`;
    }

    const notificationData: CreateNotificationDto = {
      recipientId: recipients,
      type: notificationType,
      deliveryType: 'MULTICAST',
      title,
      message,
      relatedEntityId: interview._id.toString(),
      relatedModule: 'Recruitment',
      isRead: false,
    };

    try {
      await this.notificationService.create(notificationData);
    } catch (error) {
      console.error('Failed to send interview notification:', error);
      // Don't throw error to prevent breaking the main interview flow
    }
  }

  /**
   * Helper method to automatically create interview when application stage changes
   * This is called internally by updateApplication method
   */
  /* private async autoCreateInterviewIfNeeded(
     updatedApplication: ApplicationDocument,
     previousApplication: ApplicationDocument,
     interviewData?: {
       scheduledDate: Date;
       method: InterviewMethod;
       panel: string[];
       calendarEventId?: string;
       videoLink?: string;
     }
   ): Promise<InterviewDocument | null> {
     const stageChanged = updatedApplication.currentStage !== previousApplication.currentStage;
     const isInterviewStage = updatedApplication.currentStage === ApplicationStage.HR_INTERVIEW || 
                              updatedApplication.currentStage === ApplicationStage.DEPARTMENT_INTERVIEW;
 
     if (stageChanged && isInterviewStage && interviewData) {
       // Check if interview already exists for this stage
       const existingInterview = await this.interviewModel.findOne({
         applicationId: updatedApplication._id,
         stage: updatedApplication.currentStage
       });
 
       if (!existingInterview) {
         const createInterviewDto: CreateInterviewDto = {
           applicationId: updatedApplication._id.toString(),
           stage: updatedApplication.currentStage,
           scheduledDate: interviewData.scheduledDate,
           method: interviewData.method,
           panel: interviewData.panel,
           calendarEventId: interviewData.calendarEventId,
           videoLink: interviewData.videoLink,
         };
 
         return await this.createInterview(createInterviewDto);
       }
     }
 
     return null;
   }*/
}