/**
 * useRoommateLogic Hook
 * Handles roommate requests and relationships state management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getRoommateRequests,
  getRoommates,
  acceptRoommateRequest,
  rejectRoommateRequest,
  withdrawRoommateRequest,
  endRoommateRelationship,
} from '@/services/roommatesService';
import type { RoommateRequest, Roommate } from '@/types/roommates';

export default function useRoommateLogic(userId: string) {
  const [requests, setRequests] = useState<RoommateRequest[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch roommate requests (both sent and received, including history)
   */
  const fetchRequests = useCallback(async () => {
    try {
      const data = await getRoommateRequests({
        userId,
        type: 'all',
        // Remove status filter to get all requests (pending + history)
      });
      setRequests(data.requests);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch requests');
    }
  }, [userId]);

  /**
   * Fetch all roommates (active and history)
   */
  const fetchRoommates = useCallback(async () => {
    try {
      const data = await getRoommates({
        userId,
        activeOnly: false, // Get all roommates including history
      });
      setRoommates(data.roommates);
    } catch (err: any) {
      console.error('Error fetching roommates:', err);
      setError(err.message || 'Failed to fetch roommates');
    }
  }, [userId]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchRoommates()]);
      setLoading(false);
    };

    fetchData();
  }, [fetchRequests, fetchRoommates]);

  /**
   * Accept a roommate request
   */
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRoommateRequest(requestId, {
        requestId,
        userId,
      });
      // Refresh both requests and roommates
      await Promise.all([fetchRequests(), fetchRoommates()]);
    } catch (err: any) {
      console.error('Error accepting request:', err);
      setError(err.message || 'Failed to accept request');
      throw err;
    }
  };

  /**
   * Reject a roommate request
   */
  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRoommateRequest(requestId, {
        requestId,
        userId,
      });
      // Refresh requests
      await fetchRequests();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.message || 'Failed to reject request');
      throw err;
    }
  };

  /**
   * Withdraw a sent roommate request
   */
  const handleWithdrawRequest = async (requestId: string) => {
    try {
      await withdrawRoommateRequest(requestId, {
        requestId,
        userId,
      });
      // Refresh requests
      await fetchRequests();
    } catch (err: any) {
      console.error('Error withdrawing request:', err);
      setError(err.message || 'Failed to withdraw request');
      throw err;
    }
  };

  /**
   * End a roommate relationship
   */
  const handleEndRoommate = async (roommateId: string) => {
    try {
      await endRoommateRelationship(roommateId, {
        roommateId,
        userId,
      });
      // Refresh roommates
      await fetchRoommates();
    } catch (err: any) {
      console.error('Error ending roommate:', err);
      setError(err.message || 'Failed to end roommate relationship');
      throw err;
    }
  };

  return {
    requests,
    roommates,
    loading,
    error,
    handleAcceptRequest,
    handleRejectRequest,
    handleWithdrawRequest,
    handleEndRoommate,
    refreshRequests: fetchRequests,
    refreshRoommates: fetchRoommates,
  };
}
