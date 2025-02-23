import ThoughtAgent from "@src/shared/agents/ThoughtAgent";
import DelegateAgent from "@src/shared/agents/DelegateAgent";
import Gru from "./Gru";
import BACopilotAgent from "./BACopilotAgent";
import TranslateAgent from "./TranslateAgent";
import UiTestAgent from "./UiTestAgent";
import GoogleAgent from "./GoogleAgent";
import Agent from "@src/shared/agents/core/Agent";
import LocalConversationRepository from "@src/shared/repositories/LocalConversationRepository";
import intl from "react-intl-universal";
import ChatMessage from "@src/shared/agents/core/ChatMessage";
import BaseAgentFactory from "@src/shared/configurers/BaseAgentFactory";
import type { GluonConfigure } from "@src/shared/storages/gluonConfig";

class AgentFactory extends BaseAgentFactory {
  create(config: GluonConfigure, initMessages: ChatMessage[]): Agent {
    const props = this.thoughtAgentProps(config);

    const baCopilotKnowledgeApi = config.baCopilotKnowledgeApi ?? "";
    const baCopilotTechDescription = config.baCopilotTechDescription ?? "";
    const baCopilotApi = config.baCopilotApi ?? "";
    const apiKey = config.apiKey ?? "";

    this.setInitMessages(initMessages);
    this.setConversationRepository(new LocalConversationRepository());

    const agents: ThoughtAgent[] = [
      new GoogleAgent(props),
      new TranslateAgent(props),
      new UiTestAgent(props),
      new BACopilotAgent(
        props,
        baCopilotKnowledgeApi,
        baCopilotApi,
        baCopilotTechDescription,
        apiKey,
      ),
    ];

    const agent = new Gru(
      props,
      intl.get("assistant_name").d("Gru"),
      intl.get("agent_description_gru").d("Gru, your browser assistant"),
      agents,
    );

    const commands = [
      { value: "summary", label: intl.get("command_summary").d("/summary") },
      { value: "search", label: intl.get("command_search").d("/search") },
      { value: "tasking", label: intl.get("command_tasking").d("/tasking") },
      { value: "ui_test", label: intl.get("command_ui_test").d("/ui_test") },
      {
        value: "user_story",
        label: intl.get("command_user_story").d("/user_story"),
      },
    ];
    const delegateAgent = new DelegateAgent(
      agent,
      agents,
      commands,
      props.conversation,
    );

    this.postCreateAgent(delegateAgent);
    return delegateAgent;
  }
}

export default AgentFactory;
