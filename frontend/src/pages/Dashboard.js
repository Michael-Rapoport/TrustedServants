 import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import BubbleChart from '../components/BubbleChart';
import TimeBasedNetworkView from '../components/TimeBasedNetworkView';
import NetworkAnalytics from '../components/NetworkAnalytics';

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [relationshipData, setRelationshipData] = useState(null);
  const [networkViews, setNetworkViews] = useState([]);
  const [selectedView, setSelectedView] = useState(null);
  const [viewName, setViewName] = useState('');
  const [timeBasedData, setTimeBasedData] = useState(null);
  const [networkAnalytics, setNetworkAnalytics] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [depth, setDepth] = useState(1);
  const [minAmount, setMinAmount] = useState(0);
  const [relationshipTypes, setRelationshipTypes] = useState(['financial', 'ownership', 'collaboration']);
  const { toast } = useToast();

  const fetchEntityRelationships = useCallback(async (entityId) => {
    try {
      const response = await axios.get(`${API_URL}/entity-relationships`, {
        params: {
          entity_id: entityId,
          depth: depth,
          min_amount: minAmount,
          relationship_types: relationshipTypes,
          search: searchTerm
        }
      });
      setRelationshipData(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch entity relationships",
        variant: "destructive",
      });
    }
  }, [toast, depth, minAmount, relationshipTypes, searchTerm]);

  const fetchNetworkViews = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/network-views`);
      setNetworkViews(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch network views",
        variant: "destructive",
      });
    }
  }, [toast]);

  const saveNetworkView = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/save-network-view`, {
        name: viewName,
        data: relationshipData
      });
      toast({
        title: "Success",
        description: "Network view saved successfully",
      });
      fetchNetworkViews();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save network view",
        variant: "destructive",
      });
    }
  }, [viewName, relationshipData, fetchNetworkViews, toast]);

  const loadNetworkView = useCallback(async (viewId) => {
    try {
      const response = await axios.get(`${API_URL}/network-view/${viewId}`);
      setRelationshipData(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load network view",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTimeBasedNetwork = useCallback(async (entityId) => {
    try {
      const response = await axios.get(`${API_URL}/time-based-network`, {
        params: {
          entity_id: entityId,
          start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
          end_date: new Date().toISOString()
        }
      });
      setTimeBasedData(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch time-based network data",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchNetworkAnalytics = useCallback(async (entityId) => {
    try {
      const response = await axios.get(`${API_URL}/network-analytics`, {
        params: { entity_id: entityId }
      });
      setNetworkAnalytics(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch network analytics",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchNetworkViews();
  }, [fetchNetworkViews]);

  const handleExpandNode = useCallback((entityId) => {
    setSelectedEntity({ id: entityId });
    fetchEntityRelationships(entityId);
  }, [fetchEntityRelationships]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Political Corruption Identification Dashboard</h1>
      
      <div className="mb-4">
        <Input
          placeholder="Search entities"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <div>
          <label>Depth:</label>
          <Input
            type="number"
            min="1"
            max="3"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Min Amount:</label>
          <Input
            type="number"
            min="0"
            value={minAmount}
            onChange={(e) => setMinAmount(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4">
        <label>Relationship Types:</label>
        {['financial', 'ownership', 'collaboration'].map(type => (
          <label key={type} className="ml-2">
            <input
              type="checkbox"
              checked={relationshipTypes.includes(type)}
              onChange={(e) => {
                if (e.target.checked) {
                  setRelationshipTypes([...relationshipTypes, type]);
                } else {
                  setRelationshipTypes(relationshipTypes.filter(t => t !== type));
                }
              }}
            />
            {type}
          </label>
        ))}
      </div>

      <Button onClick={() => fetchEntityRelationships(selectedEntity?.id)} disabled={!selectedEntity}>
        Apply Filters
      </Button>

      {relationshipData && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Relationship Network</CardTitle>
          </CardHeader>
          <CardContent>
            <BubbleChart
              data={relationshipData}
              onExpandNode={handleExpandNode}
              searchTerm={searchTerm}
            />
          </CardContent>
        </Card>
      )}

      <div className="mt-4">
        <Input
          placeholder="Enter view name"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
        />
        <Button onClick={saveNetworkView} className="mt-2">Save Current View</Button>
      </div>

      <div className="mt-4">
        <Select onValueChange={(value) => loadNetworkView(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Load saved view" />
          </SelectTrigger>
          <SelectContent>
            {networkViews.map(view => (
              <SelectItem key={view.id} value={view.id}>{view.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => fetchTimeBasedNetwork(selectedEntity?.id)} className="mt-4" disabled={!selectedEntity}>
        View Time-Based Network
      </Button>

      {timeBasedData && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Time-Based Network View</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeBasedNetworkView data={timeBasedData} />
          </CardContent>
        </Card>
      )}

      <Button onClick={() => fetchNetworkAnalytics(selectedEntity?.id)} className="mt-4" disabled={!selectedEntity}>
        View Network Analytics
      </Button>

      {networkAnalytics && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Network Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkAnalytics data={networkAnalytics} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
