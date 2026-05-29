import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ErrorCode, type ErrorCode as ErrorCodeType } from '@/common/errors';
import type { ValidationDetail } from '@/common/response';

export interface MappedPrismaError {
  statusCode: number;
  message: string;
  code: ErrorCodeType;
  details?: ValidationDetail[];
}

export function mapPrismaError(error: unknown): MappedPrismaError | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return mapKnownError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid database query',
      code: ErrorCode.BAD_REQUEST,
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database connection failed',
      code: ErrorCode.DATABASE_ERROR,
    };
  }

  return null;
}

function mapKnownError(
  error: Prisma.PrismaClientKnownRequestError,
): MappedPrismaError {
  switch (error.code) {
    case 'P2002':
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with this value already exists',
        code: ErrorCode.CONFLICT,
        details: uniqueConstraintDetails(error),
      };
    case 'P2025':
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        code: ErrorCode.RESOURCE_NOT_FOUND,
      };
    case 'P2003':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Related record not found',
        code: ErrorCode.BAD_REQUEST,
      };
    case 'P2014':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid relation in query',
        code: ErrorCode.BAD_REQUEST,
      };
    default:
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed',
        code: ErrorCode.DATABASE_ERROR,
      };
  }
}

function uniqueConstraintDetails(
  error: Prisma.PrismaClientKnownRequestError,
): ValidationDetail[] | undefined {
  const target = error.meta?.target;

  if (!Array.isArray(target)) return undefined;

  return target
    .filter((field): field is string => typeof field === 'string')
    .map((field) => ({ field, message: `${field} already exists` }));
}
