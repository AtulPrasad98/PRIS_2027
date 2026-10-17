CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`contactId` int NOT NULL,
	`interactionId` int,
	`kind` enum('Person intelligence','Introduction','Conversation','Project match') NOT NULL,
	`neutralSummary` text,
	`directEvidence` text,
	`interpretation` text,
	`currentRelationshipState` varchar(120),
	`proposedRelationshipState` varchar(120),
	`opennessRating` int,
	`opennessEvidence` text,
	`opportunitySignal` varchar(40),
	`recommendedAction` varchar(220),
	`rationale` text,
	`draftMessage` text,
	`timingGuidance` text,
	`unknowns` text,
	`confidence` enum('High','Medium','Low','Insufficient Evidence') NOT NULL DEFAULT 'Medium',
	`output` json,
	`userDecision` enum('Approved','Edited','Rejected','Deferred','N/A') NOT NULL DEFAULT 'N/A',
	`userFeedback` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`profileUrl` varchar(600),
	`currentRole` varchar(220),
	`organization` varchar(220),
	`industry` varchar(160),
	`location` varchar(160),
	`professionalBackground` text,
	`professionalTopics` text,
	`notableContributions` text,
	`sharedInterests` text,
	`connectionRationale` text,
	`professionalRelevance` enum('Low','Medium','High'),
	`relationshipState` enum('Research Pending','Ready to Connect','Connected','Acknowledged','Conversational','Shared Relevance','Developing Relationship','Opportunity Discussion','Active Opportunity or Advocacy','Maintenance','Paused','Not Interested','Closed','Needs Review') NOT NULL DEFAULT 'Research Pending',
	`conversationStatus` enum('No conversation','Awaiting reply','User owes reply','Recipient owes reply','Active','Dormant','Closed') NOT NULL DEFAULT 'No conversation',
	`opennessRating` int,
	`opennessEvidence` text,
	`opportunitySignal` enum('None','Possible','Explicit','Active') NOT NULL DEFAULT 'None',
	`nextAction` varchar(220),
	`nextActionDueAt` timestamp,
	`tags` json,
	`userNotes` text,
	`researchConfidence` enum('High','Medium','Low','Insufficient Evidence') NOT NULL DEFAULT 'Insufficient Evidence',
	`lastResearchAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidenceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`contactId` int NOT NULL,
	`sourceTitle` varchar(240) NOT NULL,
	`sourceUrl` varchar(700),
	`sourceType` enum('Official bio','Company page','Article','Public post','Portfolio','User-provided note','Other') NOT NULL DEFAULT 'User-provided note',
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	`publishedAt` timestamp,
	`claimSupported` text NOT NULL,
	`evidenceExcerpt` text,
	`evidenceStatus` enum('Verified','User-provided','Inference','Unknown','Outdated') NOT NULL DEFAULT 'User-provided',
	`confidence` enum('High','Medium','Low','Insufficient Evidence') NOT NULL DEFAULT 'Medium',
	`relevanceReason` text,
	`reviewAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidenceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followUps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`contactId` int NOT NULL,
	`dueAt` timestamp NOT NULL,
	`reason` text NOT NULL,
	`status` enum('Planned','Completed','Dismissed') NOT NULL DEFAULT 'Planned',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followUps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`contactId` int NOT NULL,
	`interactionDate` timestamp NOT NULL,
	`channel` enum('LinkedIn','Email','Event','Call','Other') NOT NULL DEFAULT 'LinkedIn',
	`direction` enum('Outbound','Inbound','In-person','Other') NOT NULL,
	`interactionType` enum('Connection note','First message','Reply','Follow-up','Resource shared','Meeting','Other') NOT NULL DEFAULT 'Other',
	`contentOrSummary` text NOT NULL,
	`actualMessageText` text,
	`context` text,
	`userIntendedOutcome` text,
	`sourceOfRecord` enum('Manually entered','Imported by user') NOT NULL DEFAULT 'Manually entered',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`professionalPositioning` text,
	`background` text,
	`skills` json,
	`careerInterests` text,
	`communicationPreferences` text,
	`disclosureBoundaries` text,
	`lastConfirmedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_ownerId_unique` UNIQUE(`ownerId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(220) NOT NULL,
	`description` text,
	`problemAddressed` text,
	`intendedUser` text,
	`contribution` text,
	`toolsUsed` text,
	`skillsDemonstrated` text,
	`evidenceOfCompletion` text,
	`verifiedOutcomes` text,
	`publicUrl` varchar(700),
	`intendedAudience` text,
	`relevantIndustries` text,
	`relevantTopics` text,
	`limitations` text,
	`isConfirmed` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stateHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`contactId` int NOT NULL,
	`previousState` varchar(120),
	`newState` varchar(120) NOT NULL,
	`reason` text NOT NULL,
	`evidence` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stateHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `valueMatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`contactId` int NOT NULL,
	`projectId` int NOT NULL,
	`recipientContext` text,
	`relevanceExplanation` text,
	`suggestedContribution` text,
	`readinessToShare` enum('Ready','Needs user review','Not ready') NOT NULL DEFAULT 'Needs user review',
	`confidence` enum('High','Medium','Low','Insufficient Evidence') NOT NULL DEFAULT 'Medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valueMatches_id` PRIMARY KEY(`id`)
);
