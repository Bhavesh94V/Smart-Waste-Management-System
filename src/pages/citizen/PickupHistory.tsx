'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge'
import { Spinner } from '@/components/ui/spinner'
import { citizenAPI } from '@/services/api'
import { PickupRequest } from '@/types'
import { format } from 'date-fns'
import { History, Package, RefreshCw } from 'lucide-react'

export default function PickupHistory() {
  const { user } = useAuth()
  const [completedRequests, setCompletedRequests] = useState<PickupRequest[]>([])
  const [allRequests, setAllRequests] = useState<PickupRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response: any = await citizenAPI.getPickupRequests(undefined, 1, 50)
      // Backend: { success: true, data: { total, page, pages, items: [...] } }
      const requests: PickupRequest[] = response?.data?.items || []
      setAllRequests(requests)
      const completed = requests.filter(
        r => r.requestStatus === 'completed' || r.requestStatus === 'verified' || r.requestStatus === 'collected'
      )
      setCompletedRequests(completed)
    } catch (err: any) {
      setError(err.message || 'Failed to load history')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-destructive mb-4'>{error}</p>
        <Button onClick={loadHistory}>
          <RefreshCw className='w-4 h-4 mr-2' />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6 animate-fade-in'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Pickup History</h1>
          <p className='text-muted-foreground mt-1'>View your past pickup requests</p>
        </div>
        <Button variant='outline' size='sm' onClick={loadHistory}>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Completed */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='w-5 h-5 text-primary' />
            Completed Pickups
          </CardTitle>
          <CardDescription>{completedRequests.length} completed requests</CardDescription>
        </CardHeader>
        <CardContent>
          {completedRequests.length === 0 ? (
            <div className='text-center py-12'>
              <Package className='w-16 h-16 mx-auto mb-4 text-muted-foreground/50' />
              <h3 className='text-lg font-semibold mb-2'>No History Yet</h3>
              <p className='text-muted-foreground'>Your completed pickup requests will appear here</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Waste Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Qty (kg)</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRequests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>{format(new Date(request.createdAt), 'PP')}</TableCell>
                      <TableCell><WasteTypeBadge type={request.wasteType} /></TableCell>
                      <TableCell className='max-w-[200px] truncate'>{request.pickupAddress}</TableCell>
                      <TableCell>{request.wasteQuantity}</TableCell>
                      <TableCell className='font-semibold'>
                        {request.estimatedServiceCharge ? `\u20B9${request.estimatedServiceCharge}` : '-'}
                      </TableCell>
                      <TableCell><StatusBadge status={request.requestStatus} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Requests */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>Complete history of your pickup requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{format(new Date(request.createdAt), 'PP')}</TableCell>
                    <TableCell><WasteTypeBadge type={request.wasteType} /></TableCell>
                    <TableCell>{request.preferredTimeSlot || '-'}</TableCell>
                    <TableCell><StatusBadge status={request.requestStatus} /></TableCell>
                    <TableCell className='font-semibold'>
                      {request.estimatedServiceCharge ? `\u20B9${request.estimatedServiceCharge}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
