import { useState, useCallback, useEffect } from 'react';
import type { Message } from '../components/ai-assistant/message-list';

interface SelectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  imageData?: string;
}

interface PartNumber {
  id: string;
  part_drawing_2d: string | null;
  part_name?: string | null;
  drawing_number?: string | null;
}

// Simulated responses based on context
const getSimulatedResponse = (
  message: string, 
  hasRegion: boolean, 
  partNumber: PartNumber
): string => {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses
  if (hasRegion) {
    if (lowerMessage.includes('dimension') || lowerMessage.includes('measure')) {
      return `Based on the selected region, I can see several critical dimensions. The highlighted area appears to show toleranced features that are crucial for manufacturing. For precise measurements, I recommend referring to the dimension callouts in the original drawing.

Key observations:
• Multiple tolerance specifications visible
• Critical fit dimensions indicated
• Surface finish requirements noted

Would you like me to analyze specific aspects of this region?`;
    }
    
    if (lowerMessage.includes('material') || lowerMessage.includes('alloy')) {
      return `Looking at the selected region, I can identify material specifications and requirements:

• The geometry suggests this part requires good machinability
• Based on the tolerances shown, a stable material with consistent properties is needed
• Consider aluminum alloys (6061-T6) for lightweight applications or steel grades for higher strength requirements

The selected area shows features that will influence material selection based on functional requirements.`;
    }
    
    if (lowerMessage.includes('manufacturing') || lowerMessage.includes('machining') || lowerMessage.includes('process')) {
      return `Analyzing the selected region for manufacturing processes:

**Primary Processes Required:**
• CNC Machining for precision features
• Potentially secondary operations for surface finishing

**Manufacturing Considerations:**
• The tolerances in this region require careful setup and tooling
• Multiple operations may be needed to achieve the specified geometry
• Consider work holding solutions for complex features

**Estimated Complexity:** Medium to High based on tolerance requirements.`;
    }
    
    if (lowerMessage.includes('tolerance') || lowerMessage.includes('accuracy')) {
      return `The selected region shows several critical tolerances:

**Tolerance Analysis:**
• Geometric dimensioning and tolerancing (GD&T) symbols present
• Tight tolerance requirements visible
• Position and form tolerances specified

**Manufacturing Impact:**
• Requires precision machining equipment
• Multiple inspection points needed
• Consider tolerance stack-up during manufacturing planning

These tolerances will significantly impact manufacturing cost and lead time.`;
    }
    
    // Generic region response
    return `Analyzing the selected region of the technical drawing...

I can see specific details in this area that are important for manufacturing planning. The region contains:

• Detailed dimensional information
• Manufacturing specifications
• Critical geometric features

What specific aspect of this region would you like me to focus on? I can provide insights on:
- Manufacturing processes required
- Material recommendations
- Tolerance analysis
- Cost estimation factors`;
  }
  
  // Full document responses
  if (lowerMessage.includes('material') || lowerMessage.includes('alloy')) {
    const partName = partNumber.part_name || partNumber.drawing_number || 'this part';
    return `Based on my analysis of the complete technical drawing for ${partName}:

**Material Recommendations:**
• **Aluminum 6061-T6**: Excellent for lightweight applications with good strength-to-weight ratio
• **Steel 1018**: Cost-effective for general purpose applications
• **Stainless Steel 304**: If corrosion resistance is required

**Selection Factors:**
• Operating environment and conditions
• Strength and durability requirements
• Weight considerations
• Budget constraints
• Surface finish requirements

The drawing shows features that would work well with standard aluminum alloys. Would you like specific material property details?`;
  }
  
  if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('estimate')) {
    return `Preliminary cost analysis for this part:

**Cost Factors Identified:**
• Complexity: Medium to High based on geometry
• Material utilization: Good (minimal waste expected)
• Machining time: Moderate due to multiple features
• Setup complexity: Standard to moderate

**Estimated Cost Ranges:**
• Prototype quantities (1-10): $150-300 per part
• Small production (50-100): $75-150 per part
• Medium production (500+): $45-85 per part

**Cost Optimization Opportunities:**
• Standardize hole sizes and features
• Consider design for manufacturability improvements
• Evaluate material alternatives

Would you like me to break down specific cost drivers?`;
  }
  
  if (lowerMessage.includes('manufacturing') || lowerMessage.includes('machining') || lowerMessage.includes('process')) {
    return `Complete manufacturing process analysis:

**Primary Manufacturing Processes:**
1. **CNC Machining** - Main process for precision features
2. **Material Preparation** - Cutting/sawing to rough size
3. **Deburring** - Edge finishing and cleanup
4. **Inspection** - Quality control and verification

**Process Sequence:**
1. Material procurement and inspection
2. Rough machining operations
3. Semi-finish machining
4. Finish machining with tight tolerances
5. Final inspection and packaging

**Equipment Requirements:**
• 3-axis CNC machining center minimum
• Standard tooling package
• Precision measurement equipment

**Estimated Lead Time:** 2-3 weeks for prototype, 4-6 weeks for production setup.`;
  }
  
  if (lowerMessage.includes('dimension') || lowerMessage.includes('measure') || lowerMessage.includes('size')) {
    return `Key dimensional analysis of the technical drawing:

**Critical Dimensions Identified:**
• Overall part envelope and bounding box
• Hole locations and sizes with position tolerances
• Surface-to-surface relationships
• Angular features and orientations

**Tolerance Requirements:**
• Standard machining tolerances: ±0.005" typical
• Critical features may require ±0.002" or tighter
• Position tolerances for hole patterns

**Measurement Strategy:**
• CMM inspection for critical features
• Go/no-go gauges for production verification
• Standard measuring tools for non-critical dimensions

Select a specific region if you'd like detailed dimension analysis for that area.`;
  }
  
  if (lowerMessage.includes('quality') || lowerMessage.includes('inspection')) {
    return `Quality control and inspection requirements:

**Inspection Points:**
• Incoming material verification
• First article inspection (FAI)
• In-process dimensional checks
• Final inspection before delivery

**Quality Standards:**
• AS9100 aerospace standards (if applicable)
• ISO 9001 general quality management
• Customer-specific requirements

**Inspection Equipment:**
• Coordinate Measuring Machine (CMM)
• Height gauges and micrometers
• Thread gauges and plug gauges
• Surface roughness tester

**Documentation:**
• Certificate of Conformance (C of C)
• Inspection reports with actual measurements
• Material traceability records

What specific quality aspects are most important for this application?`;
  }
  
  // Default responses
  const defaultResponses = [
    `I've analyzed the technical drawing and can provide insights on various aspects:

**Available Analysis:**
• Manufacturing processes and methods
• Material selection recommendations  
• Cost estimation and optimization
• Quality control requirements
• Lead time projections

What specific information would you like me to provide about this part?`,

    `Based on the technical drawing, this appears to be a precision-machined component with several interesting features:

**Key Observations:**
• Multiple machined surfaces with varying tolerances
• Strategic hole patterns for assembly or mounting
• Design optimized for manufacturing efficiency
• Standard materials and processes applicable

Feel free to ask about specific aspects like materials, manufacturing processes, or cost analysis. You can also select regions of the drawing for detailed analysis.`,

    `This technical drawing shows a well-designed part with good manufacturability characteristics:

**Manufacturing Assessment:**
• Suitable for CNC machining processes
• Reasonable tolerance requirements
• Standard tooling and equipment applicable
• Good material utilization expected

**Next Steps:**
• Select specific regions for detailed analysis
• Ask about manufacturing processes
• Inquire about material recommendations
• Request cost estimation details

How can I help you with this part?`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export function useSimulatedChat(
  partNumber: PartNumber,
  selectedRegion: SelectedRegion | null,
  regionSnapshot: string | null
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Add initial message if no PDF is available
  useEffect(() => {
    if (!partNumber.part_drawing_2d && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `assistant-welcome-${Date.now()}`,
        type: 'assistant',
        content: `Hello! I'm here to help with technical analysis of your part.

Unfortunately, no technical drawing is currently available for this part number. However, I can still provide general guidance on:

• Manufacturing processes and recommendations
• Material selection advice
• Cost estimation principles
• Quality control best practices
• General machining and fabrication insights

Please feel free to ask any questions about manufacturing or technical aspects of your part!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [partNumber.part_drawing_2d, messages.length]);

  const sendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    const delay = Math.random() * 1000 + 1500; // 1.5-2.5 seconds
    
    setTimeout(() => {
      const response = getSimulatedResponse(content, !!selectedRegion, partNumber);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        hasRegionContext: !!selectedRegion,
        regionSnapshot: regionSnapshot || undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, delay);
  }, [partNumber, selectedRegion, regionSnapshot]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages
  };
}